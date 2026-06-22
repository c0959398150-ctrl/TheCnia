'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface HardwareItem {
  id: number
  title: string
  category: string
  affiliate_url: string
  price: string
  item_type: string
  build_set_id: string
  image_url?: string
}

export default function AdminPage() {
  // 🔒 สถานะสำหรับระบบ Login
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // 🔮 สถานะสำหรับระบบหลังบ้านเดิมของคุณ
  const [items, setItems] = useState<HardwareItem[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('CPU (ซีพียู)')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  
  const [itemType, setItemType] = useState('individual')
  const [buildSetId, setBuildSetId] = useState('')

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  // 🔄 ตรวจสอบว่าเคยเข้าสู่ระบบไปแล้วหรือยังใน Session นี้
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated')
    if (authStatus === 'true') {
      setIsAuthorized(true)
      fetchItems() // โหลดข้อมูลถ้ามีสิทธิ์อยู่แล้ว
    }
  }, [])

  const fetchItems = async () => {
    setFetchLoading(true)
    const { data, error } = await supabase
      .from('affiliate_links')
      .select('*')
      .order('id', { ascending: false })
    
    if (!error && data) {
      setItems(data)
    }
    setFetchLoading(false)
  }

  // 🔐 ฟังก์ชันยืนยันรหัสผ่านผ่าน API Route
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminPassword) {
      alert('กรุณากรอกรหัสผ่าน')
      return
    }
    setAuthLoading(true)

    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsAuthorized(true)
        sessionStorage.setItem('isAdminAuthenticated', 'true')
        fetchItems() // เริ่มดึงข้อมูลสินค้าทันทีหลังจากผ่านด่าน
      } else {
        alert(data.error || 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง!')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบตรวจสอบสิทธิ์')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !affiliateUrl) {
      alert('กรุณากรอกชื่อสินค้าและลิงก์ Affiliate')
      return
    }

    if (itemType === 'set_component' && !buildSetId.trim()) {
      alert('กรุณากรอก รหัสเซ็ตสเปกคอม สำหรับสินค้าชิ้นนี้')
      return
    }

    setLoading(true)

    const insertData = {
      title,
      category,
      affiliate_url: affiliateUrl,
      image_url: imageUrl || null,
      price,
      item_type: itemType,
      build_set_id: itemType === 'set_component' ? buildSetId.trim().toLowerCase() : null
    }

    const { error } = await supabase
      .from('affiliate_links')
      .insert([insertData])

    setLoading(false)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว!')
      setTitle('')
      setAffiliateUrl('')
      setImageUrl('')
      setPrice('')
      setBuildSetId('')
      fetchItems()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบลิงก์นี้?')) {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('ไม่สามารถลบได้: ' + error.message)
      } else {
        fetchItems()
      }
    }
  }

  // 🔒 1. หน้ากั้น LOGIN (จะแสดงผลเมื่อยังไม่ได้ตรวจสอบรหัสผ่าน)
  if (!isAuthorized) {
    return (
      <div style={{ backgroundColor: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '1rem' }}>
        <form onSubmit={handleAdminLogin} style={{ background: '#070f1e', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(0, 242, 254, 0.2)', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#00F2FE', marginBottom: '0.5rem', fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.5px' }}>🛡️ Admin Control</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '1.75rem' }}>ระบบตรวจสอบสิทธิ์การจัดการข้อมูลหลังบ้าน</p>
          
          <input 
            type="password" 
            placeholder="กรอกรหัสผ่านแอดมิน" 
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            disabled={authLoading}
            style={{ width: '100%', padding: '12px 14px', background: '#030712', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', marginBottom: '1.5rem', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }}
          />
          
          <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0072FF 0%, #00F2FE 100%)', border: 'none', borderRadius: '8px', color: '#030712', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', opacity: authLoading ? 0.7 : 1 }}>
            {authLoading ? '⏳ กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบหลังบ้าน'}
          </button>
        </form>
      </div>
    )
  }

  // 🖥️ 2. หน้าแอดมินระบบหลัก (จะทำงานเมื่อล็อกอินผ่านสำเร็จแล้วเท่านั้น)
  return (
    <div style={{
      backgroundColor: '#030712',
      minHeight: '100vh',
      color: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
            🔮 ระบบจัดการข้อมูลเว็บไซต์ [TheCnia]
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                sessionStorage.removeItem('isAdminAuthenticated')
                setIsAuthorized(false)
                setAdminPassword('')
              }}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              🔒 ออกจากระบบ
            </button>
            <a href="/" style={{ color: '#00F2FE', textDecoration: 'none', fontSize: '14px', border: '1px solid #00F2FE', padding: '6px 14px', borderRadius: '8px' }}>
              🏠 ไปที่หน้าแรกเว็บ
            </a>
          </div>
        </div>

        {/* ➕ ฟอร์มเพิ่มข้อมูล */}
        <div style={{ background: '#070f1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '18px', color: '#00F2FE', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ➕ เพิ่มสินค้า / จัดเซตคอมพิวเตอร์ใหม่
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>ชื่อสินค้า</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น Core i5-14400F หรือ ชิ้นส่วนต่างๆ" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #1e293b', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>หมวดหมู่ฮาร์ดแวร์</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #1e293b', color: '#fff', boxSizing: 'border-box' }}>
                  <option value="CPU">CPU</option>
                  <option value="MAINBOARD">MAINBOARD</option>
                  <option value="GPU">GPU (การ์ดจอ)</option>
                  <option value="RAM">RAM</option>
                  <option value="STORAGE">STORAGE (SSD/HDD)</option>
                  <option value="CASE">CASE</option>
                  <option value="COOLER">CPU COOLER</option>
                  <option value="PSU">POWER SUPPLY</option>
                  <option value="MONITOR">MONITOR</option>
                  <option value="ACCESSORIES">ACCESSORIES / อื่นๆ</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>ลิงก์ Affiliate (Shopee / Lazada)</label>
              <input type="url" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="วางลิงก์สินค้าที่นี่" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #1e293b', color: '#fff', boxSizing: 'border-box' }} />
            </div>

            {/* 🛠️ ส่วนเลือกการจัดกลุ่มแสดงผล */}
            <div style={{ background: 'rgba(3, 7, 18, 0.6)', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#00F2FE', marginBottom: '10px' }}>🛠️ การจัดกลุ่มแสดงผลบนหน้าเว็บ</span>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="item_type" value="individual" checked={itemType === 'individual'} onChange={() => setItemType('individual')} />
                  📦 ฮาร์ดแวร์ชิ้นเดี่ยวทั่วไป (ZONE 2)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="item_type" value="set_component" checked={itemType === 'set_component'} onChange={() => setItemType('set_component')} />
                  🔥 เป็นชิ้นส่วนใน "เซ็ตสเปกคอม" (ZONE 1)
                </label>
              </div>

              {/* ช่องกรอกพิเศษคอมเซ็ต */}
              {itemType === 'set_component' && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px dashed #1e293b', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#FF9F00', marginBottom: '6px', fontWeight: '600' }}>รหัสเซ็ตคอมพิวเตอร์ (พิมพ์ติดกัน)</label>
                    <input type="text" value={buildSetId} onChange={(e) => setBuildSetId(e.target.value)} placeholder="เช่น set-20k, amd-gaming" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #FF9F00', color: '#fff', boxSizing: 'border-box' }} />
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>*ชิ้นส่วนที่รหัสเหมือนกันจะรวมเป็นเซ็ตเดียวกัน</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#FF9F00', marginBottom: '6px', fontWeight: '600' }}>ลิงก์รูปภาพของเซ็ตคอม (ใส่ชิ้นใดชิ้นหนึ่งในเซ็ต)</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="วางลิงก์รูปภาพเคสคอมพิวเตอร์ หรือรูปเซ็ตคอม" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #FF9F00', color: '#fff', boxSizing: 'border-box' }} />
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>*นำลิงก์รูปมาจากเว็บฝากรูปทั่วไป เพื่อนำมาแสดงที่ปกเซ็ต</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ gridTemplateColumns: '1fr', display: 'grid' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>ราคา (ตัวเลข เช่น 5,490 หรือใส่แค่ตัวเลขเปล่าๆ)</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="เช่น 5,490" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #1e293b', color: '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* ช่องใส่รูปภาพสินค้าชิ้นเดี่ยว */}
            {itemType === 'individual' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>ลิงก์รูปภาพสินค้าเดี่ยว (ระบุหรือไม่ก็ได้)</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="วางลิงก์รูปภาพสินค้าเดี่ยวที่นี่" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#030712', border: '1px solid #1e293b', color: '#fff', boxSizing: 'border-box' }} />
              </div>
            )}

            <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
              {loading ? '⏳ กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลและแสดงบนเว็บทันที'}
            </button>

          </form>
        </div>

        {/* 📑 รายการปัจจุบัน */}
        <div style={{ background: '#070f1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '16px', color: '#94a3b8' }}>📋 รายการสินค้าปัจจุบันบนเว็บไซต์</h3>
          
          {fetchLoading ? (
            <p style={{ color: '#64748b', textAlign: 'center' }}>กำลังโหลดรายการสินค้า...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center' }}>ยังไม่มีข้อมูลในระบบ</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#030712', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: item.item_type === 'set_component' ? 'rgba(255,159,0,0.1)' : 'rgba(0,242,254,0.1)', color: item.item_type === 'set_component' ? '#FF9F00' : '#00F2FE', border: item.item_type === 'set_component' ? '1px solid rgba(255,159,0,0.2)' : '1px solid rgba(0,242,254,0.2)' }}>
                        {item.item_type === 'set_component' ? `เซ็ต: ${item.build_set_id}` : 'สินค้าเดี่ยว'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>[{item.category}]</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{item.price ? `฿${item.price}` : '—'}</span>
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}