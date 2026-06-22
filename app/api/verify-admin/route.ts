import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // ดึงรหัสผ่านจากตาราง admin_settings ใน Supabase
    const { data, error } = await supabase
      .from('admin_settings')
      .select('secret_password')
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'ไม่พบตารางรหัสผ่านใน Supabase' }, { status: 500 })
    }

    // เปรียบเทียบรหัสผ่าน
    if (password === data.secret_password) {
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      return NextResponse.json({ success: false }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการประมวลผล' }, { status: 500 })
  }
}