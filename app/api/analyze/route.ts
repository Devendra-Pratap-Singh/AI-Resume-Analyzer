export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('File Name:', file.name)
    console.log('File Type:', file.type)
    console.log('File Size:', file.size)

    const fileName = file.name
    const fileType = file.type

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    try {
      // ===================== PDF HANDLING =====================
      if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        const pdfParse = require('pdf-parse')
        const data = await pdfParse(buffer)

        if (!data.text || data.text.trim().length < 30) {
          throw new Error(
            'This PDF appears to be scanned (image-based). Please upload a text-based PDF or DOCX from Google Docs/Word.'
          )
        }

        text = data.text
      }

      // ===================== DOCX HANDLING =====================
      else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.toLowerCase().endsWith('.docx')
      ) {
        const mammoth = require('mammoth')
        const result = await mammoth.extractRawText({ buffer })

        if (!result.value || result.value.trim().length < 30) {
          throw new Error('DOCX file appears to be empty or unreadable.')
        }

        text = result.value
      }

      // ===================== UNSUPPORTED =====================
      else {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload PDF or DOCX only.' },
          { status: 400 }
        )
      }
    } catch (parseError: any) {
      console.error('File Parsing Error:', parseError)
      return NextResponse.json(
        { error: `Failed to read file: ${parseError.message}` },
        { status: 422 }
      )
    }

    text = text.replace(/\s+/g, ' ').trim()

    if (!text || text.length < 50) {
      return NextResponse.json(
        {
          error:
            'Resume content is too short or unreadable. If you uploaded a scanned PDF, please convert it to text using Google Docs or upload DOCX.',
        },
        { status: 400 }
      )
    }

    // ===================== LOCAL ANALYSIS ENGINE =====================

    const analyzeLocally = (content: string) => {
      const lowerContent = content.toLowerCase()
      let score = 50

      const pros: string[] = []
      const cons: string[] = []
      const recommendations: string[] = []

      const sections = {
        experience: ['experience', 'work history', 'employment'],
        education: ['education', 'academic', 'university', 'college'],
        skills: ['skills', 'technologies', 'technical proficiencies'],
        projects: ['projects', 'personal work', 'portfolio'],
        contact: ['email', 'phone', 'linkedin', 'github'],
      }

      const foundSections = Object.entries(sections)
        .filter(([_, keywords]) => keywords.some((kw) => lowerContent.includes(kw)))
        .map(([name]) => name)

      score += foundSections.length * 8

      if (foundSections.includes('experience')) {
        pros.push('Professional experience section detected')
      } else {
        cons.push('Missing clear work experience section')
        recommendations.push("Add a dedicated 'Experience' section to showcase your career history.")
      }

      if (foundSections.includes('skills')) {
        pros.push('Technical skills are clearly listed')
      } else {
        cons.push('Skills section is missing or poorly defined')
        recommendations.push("Create a 'Skills' section with keywords relevant to your target roles.")
      }

      if (content.length > 1500) {
        pros.push('Comprehensive content length')
      } else if (content.length < 500) {
        score -= 15
        cons.push('Resume is too short')
        recommendations.push('Expand on your achievements and responsibilities to provide more context.')
      }

      const jobMatches: any[] = []

      if (
        lowerContent.includes('react') ||
        lowerContent.includes('javascript') ||
        lowerContent.includes('frontend')
      ) {
        jobMatches.push({
          title: 'Frontend Developer',
          matchPercentage: '92%',
          reason: 'Strong match for modern web technologies found in your profile.',
        })
      }

      if (
        lowerContent.includes('python') ||
        lowerContent.includes('data') ||
        lowerContent.includes('sql')
      ) {
        jobMatches.push({
          title: 'Data Analyst',
          matchPercentage: '88%',
          reason: 'Your experience with data processing and databases aligns well.',
        })
      }

      if (
        lowerContent.includes('manager') ||
        lowerContent.includes('lead') ||
        lowerContent.includes('agile')
      ) {
        jobMatches.push({
          title: 'Project Manager',
          matchPercentage: '85%',
          reason: 'Leadership and methodology keywords detected.',
        })
      }

      if (jobMatches.length === 0) {
        jobMatches.push({
          title: 'General Associate',
          matchPercentage: '70%',
          reason: 'Based on your general professional profile.',
        })
      }

      return {
        score: Math.min(score, 99),
        summary: `Local Analysis: Your resume contains ${foundSections.length} key professional sections. ${
          score > 70
            ? 'It is well-structured for ATS systems.'
            : 'It needs more optimization to pass automated filters.'
        }`,
        pros: pros.length > 0 ? pros : ['Basic contact information found'],
        cons: cons.length > 0 ? cons : ['No major structural issues found'],
        recommendations:
          recommendations.length > 0
            ? recommendations
            : ["Quantify your achievements with numbers (e.g., 'Increased sales by 20%')"],
        jobs: jobMatches.slice(0, 3),
      }
    }

    const analysis = analyzeLocally(text)

    const { data, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: fileName,
        score: analysis.score,
        analysis: analysis,
      })
      .select()
      .single()

    if (dbError) {
  console.error('DB Insert Error:', dbError)
  return NextResponse.json({ error: dbError.message }, { status: 500 })
}

    return NextResponse.json({ ...analysis, id: data?.id })
  } catch (error: any) {
    console.error('Analysis API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
