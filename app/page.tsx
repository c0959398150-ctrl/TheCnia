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

export default function HomePage() {
  const [items, setItems] = useState<HardwareItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🎛️ State สำหรับระบบค้นหาและฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      if (data) setItems(data)
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  // 🔍 1. กรองข้อมูลขั้นแรกตามคำค้นหา (Search)
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.build_set_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // =========================================================
  // 🔥 ZONE 1: จัดกลุ่มเซ็ตสเปกคอมพิวเตอร์ และกรองตามงบประมาณ
  // =========================================================
  const setComponents = filteredItems.filter(item => item.item_type === 'set_component')
  const allUniqueSetIds = Array.from(new Set(setComponents.map(item => item.build_set_id).filter(Boolean)))

  // กรองเซ็ตคอมตามเงื่อนไขช่วงราคา (งบประมาณ)
  const filteredSetIds = allUniqueSetIds.filter(setId => {
    if (selectedBudget === 'all') return true
    
    const componentsInSet = setComponents.filter(c => c.build_set_id === setId)
    const totalSetPrice = componentsInSet.reduce((sum, item) => {
      const cleanPrice = parseFloat(item.price?.replace(/,/g, '')) || 0
      return sum + cleanPrice
    }, 0)

    if (selectedBudget === '10k') return totalSetPrice <= 10000
    if (selectedBudget === '20k') return totalSetPrice > 10000 && totalSetPrice <= 20000
    if (selectedBudget === '30k') return totalSetPrice > 20000 && totalSetPrice <= 30000
    if (selectedBudget === '40k') return totalSetPrice > 30000 && totalSetPrice <= 40000
    if (selectedBudget === '50k') return totalSetPrice > 40000
    return true
  })

  // =========================================================
  // ⚡ ZONE 2: กรองฮาร์ดแวร์เดี่ยวตามหมวดหมู่ที่คุณเลือก
  // =========================================================
  const individualProducts = filteredItems.filter(item => {
    const isIndividual = item.item_type === 'individual' || !item.item_type
    
    // ตรวจสอบว่าหมวดหมู่ใน Base มีคำค้นหาที่เรากดเลือกอยู่หรือไม่ (Case-insensitive)
    const matchesCategory = 
      selectedCategory === 'all' || 
      item.category?.toUpperCase().includes(selectedCategory.toUpperCase())
      
    return isIndividual && matchesCategory
  })

  return (
    <div style={{
      backgroundColor: '#030712',
      backgroundImage: 'radial-gradient(circle at top, #0c1e3d 0%, #030712 100%)',
      minHeight: '100vh',
      color: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '5rem'
    }}>
      
      {/* 🌐 NAVBAR */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem 2rem', 
        borderBottom: '1px solid rgba(255,255,255,0.05)', 
        backgroundColor: 'rgba(3, 7, 18, 0.8)', 
        position: 'sticky', 
        top: 0, 
        backdropFilter: 'blur(12px)', 
        zIndex: 50 
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>
          The<span style={{ color: '#FF9F00' }}>Cnia</span>
        </div>
        <a href="/admin" style={{ color: '#00F2FE', textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '8px 16px', borderRadius: '20px', background: 'rgba(0, 242, 254, 0.05)', fontWeight: '600' }}>
          🛡️ Admin Control
        </a>
      </nav>

      {/* 🚀 HERO */}
      <header style={{ textAlign: 'center', padding: '4rem 1rem 2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #ffffff, #00F2FE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          คัดสรรสเปกคอม 
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>
          ยินดีต้อนรับผู้ที่เข้ามาเยือนทุกท่าน
        </p>
      </header>

      {/* 🎛️ CONTROL PANEL (SEARCH & FILTERS) */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#070f1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          {/* 🔍 ช่องค้นหา */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input
              type="text" 
              placeholder="🔍 ค้นหาชื่อฮาร์ดแวร์, ชิ้นส่วน หรือรหัสสเปกคอม..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', background: '#030712', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* 💰 ตัวกรองงบประมาณ (ZONE 1) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FF9F00', marginBottom: '10px' }}>🖥️ จัดเซตตามงบประมาณประมาณ:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: '10k', label: 'ไม่เกิน 10,000 ฿' },
                { id: '20k', label: 'ไม่เกิน 20,000 ฿' },
                { id: '30k', label: 'ไม่เกิน 30,000 ฿' },
                { id: '40k', label: 'ไม่เกิน 40,000 ฿' },
                { id: '50k', label: 'ไม่เกิน 50,000 ฿+' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBudget(b.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1px solid',
                    borderColor: selectedBudget === b.id ? '#FF9F00' : '#1e293b',
                    background: selectedBudget === b.id ? 'rgba(255, 159, 0, 0.15)' : '#030712',
                    color: selectedBudget === b.id ? '#FF9F00' : '#94a3b8',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* ⚡ ตัวกรองหมวดหมู่แยกชิ้น (ZONE 2) */}
          <div>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#00F2FE', marginBottom: '10px' }}>⚡ หมวดหมู่ฮาร์ดแวร์แยกชิ้น:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'CPU', label: 'CPU' },
                { id: 'MAINBOARD', label: 'MAINBOARD' },
                { id: 'GPU', label: 'GPU (การ์ดจอ)' },
                { id: 'RAM', label: 'RAM' },
                { id: 'STORAGE', label: 'STORAGE (SSD/HDD)' },
                { id: 'CASE', label: 'CASE' },
                { id: 'COOLER', label: 'CPU COOLER' },
                { id: 'PSU', label: 'POWER SUPPLY' },
                { id: 'MONITOR', label: 'MONITOR' },
                { id: 'ACCESSORIES', label: 'ACCESSORIES / อื่นๆ' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1px solid',
                    borderColor: selectedCategory === cat.id ? '#00F2FE' : '#1e293b',
                    background: selectedCategory === cat.id ? 'rgba(0, 242, 254, 0.15)' : '#030712',
                    color: selectedCategory === cat.id ? '#00F2FE' : '#94a3b8',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 📦 MAIN CONTENT */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: '1rem' }}>❌ ข้อผิดพลาด: {error}</div>}
        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>กำลังโหลดข้อมูลพิกัดไอที...</p>}

        {!loading && (
          <>
            {/* ========================================================= */}
            {/* 🔥 DISPLAY ZONE 1: เซ็ตจัดสเปกคอมพิวเตอร์แนะนำ */}
            {/* ========================================================= */}
            <section style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ width: '4px', height: '22px', background: '#FF9F00', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  🖥️ จัดเซตสเปกคอมพิวเตอร์แนะนำ ({filteredSetIds.length})
                </h2>
              </div>

              {filteredSetIds.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px', background: 'rgba(255,255,255,0.01)', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #1e293b' }}>
                  ไม่พบข้อมูลสเปกคอมตามเงื่อนไขที่เลือก...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {filteredSetIds.map((setId) => {
                    const componentsInSet = setComponents.filter(c => c.build_set_id === setId)
                    const totalPresetPrice = componentsInSet.reduce((sum, item) => {
                      const cleanPrice = parseFloat(item.price?.replace(/,/g, '')) || 0
                      return sum + cleanPrice
                    }, 0)

                    {/* 📸 ปรับปรุงส่วนค้นหารูปภาพให้เจาะจงตรวจสอบค่าว่างอย่างแม่นยำ */}
                    const setCoverImage = componentsInSet.find(c => c.image_url && c.image_url.trim() !== '')?.image_url

                    return (
                      <div key={setId} style={{ background: '#070f1e', borderRadius: '16px', border: '1px solid rgba(255, 159, 0, 0.12)', padding: '1.5rem' }}>
                        
                        {/* ส่วนหัวของเซ็ต */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'linear-gradient(135deg, #FF6B00 0%, #FF9F00 100%)', color: '#030712', fontWeight: 'bold', fontSize: '12px' }}>
                            BUILD SET: {String(setId).toUpperCase()}
                          </span>
                          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                            ราคารวม: <span style={{ color: '#10b981', fontSize: '22px', fontWeight: '800' }}>{totalPresetPrice > 0 ? `฿${totalPresetPrice.toLocaleString()}` : 'เช็กราคาในลิงก์'}</span>
                          </div>
                        </div>

                        {/* 🛠️ แก้ไข Layout ตรงนี้โดยลบ window.innerWidth ออก เพื่อแก้ปัญหาโปรแกรมค้าง/ล่มบน Next.js */}
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: 'row' }}>
                          
                          {/* 🖼️ กล่องแสดงรูปภาพหน้าปกประจำเซ็ต */}
                          <div style={{ width: '100%', maxWidth: '220px', height: '220px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)', padding: '10px', margin: '0 auto' }}>
                            {setCoverImage ? (
                              <img src={setCoverImage} alt={`Cover for ${setId}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                           
                            ) : (
                              <div style={{ textAlign: 'center', color: '#64748b' }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🖥️</span>
                                <span style={{ fontSize: '12px' }}>ไม่มีรูปภาพเซ็ต</span>
                              </div>
                            )}
                          </div>

                          {/* รายการชิ้นส่วนอุปกรณ์ภายในเซ็ตคอม */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 300px' }}>
                            {componentsInSet.map((comp) => (
                              <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(3, 7, 18, 0.3)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.01)' }}>
                                
                                {/* รายละเอียดอุปกรณ์ชิ้นนั้นๆ */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <span style={{ fontSize: '11px', color: '#FF9F00', background: 'rgba(255,159,0,0.1)', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '600', display: 'inline-block' }}>
                                      {comp.category}
                                    </span>
                                    <span style={{ fontSize: '14px', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'middle', maxWidth: '80%' }}>
                                      {comp.title}
                                    </span>
                                  </div>
                                </div>

                                {/* ปุ่มราคาและ Aff_url */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>{comp.price ? `฿${comp.price}` : '—'}</span>
                                  <a href={comp.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ background: '#FF9F00', color: '#030712', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                    ไปสั่งซื้อ 🛒
                                  </a>
                                </div>

                              </div>
                            ))}
                          </div>

                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ========================================================= */}
            {/* ⚡ DISPLAY ZONE 2: พิกัดฮาร์ดแวร์เดี่ยวตามหมวดหมู่ */}
            {/* ========================================================= */}
            <section style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ width: '4px', height: '22px', background: '#00F2FE', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  ⚡ พิกัดฮาร์ดแวร์เดี่ยว & อุปกรณ์ไอทีแนะนำ ({individualProducts.length})
                </h2>
              </div>

              {individualProducts.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px', background: 'rgba(255,255,255,0.01)', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #1e293b' }}>
                  ไม่พบสินค้าเดี่ยวในหมวดหมู่ที่เลือกขณะนี้...
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {individualProducts.map((item) => (
                    <div key={item.id} style={{ background: '#070f1e', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      
                      {/* ส่วนแสดงรูปภาพสินค้าเดี่ยว */}
                      <div style={{ height: '160px', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid #1e293b', padding: '10px' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '40px' }}>📦</span>
                        )}
                      </div>

                      {/* รายละเอียดสิ่งของ */}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <span style={{ fontSize: '11px', color: '#00F2FE', background: 'rgba(0,242,254,0.08)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginBottom: '6px' }}>
                            {item.category}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e5e7eb', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.title}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>ราคา</span>
                            <span style={{ fontSize: '17px', fontWeight: 'bold', color: '#10b981' }}>{item.price ? `฿${item.price}` : 'เช็กราคา'}</span>
                          </div>
                          <a href={item.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #0072FF 0%, #00F2FE 100%)', color: '#030712', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                            ไปซื้อสินค้า
                          </a>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

    </div>
  )
}