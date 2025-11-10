import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import Tesseract from 'tesseract.js'

export default function Dashboard({ backendURL }) {
  const [token] = useState(localStorage.getItem('ts_token'))
  const [group, setGroup] = useState(null)
  const [groupCode, setGroupCode] = useState('')
  const [groupName, setGroupName] = useState('My Trip')
  const [expenses, setExpenses] = useState([])
  const [insights, setInsights] = useState(null)

  const socket = useMemo(()=> io(backendURL, { auth: { token } }), [backendURL, token])

  useEffect(()=>{
    socket.on('connect', ()=>{})
    socket.on('expense:new', (payload)=>{
      if(group && payload.group_id === group._id){
        setExpenses(prev=> [payload, ...prev])
      }
    })
    return ()=> socket.disconnect()
  }, [socket, group])

  async function authHeaders(){
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }

  async function createGroup(){
    const res = await fetch(`${backendURL}/groups`, { method:'POST', headers: await authHeaders(), body: JSON.stringify({ name: groupName }) })
    const data = await res.json();
    await loadGroup(data.group_id)
  }

  async function joinGroup(){
    const res = await fetch(`${backendURL}/groups/join`, { method:'POST', headers: await authHeaders(), body: JSON.stringify({ code: groupCode }) })
    const data = await res.json();
    await loadGroup(data.group_id)
  }

  async function loadGroup(id){
    const res = await fetch(`${backendURL}/groups/${id}`, { headers: await authHeaders() })
    const data = await res.json();
    setGroup(data)
    await refreshExpenses(id)
    await refreshInsights(id)
  }

  async function refreshExpenses(id){
    const res = await fetch(`${backendURL}/expenses/${id}`, { headers: await authHeaders() })
    setExpenses(await res.json())
  }

  async function refreshInsights(id){
    const res = await fetch(`${backendURL}/insights/${id}`, { headers: await authHeaders() })
    setInsights(await res.json())
  }

  async function handleAddExpense(e){
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = Object.fromEntries(form.entries())
    payload.amount = parseFloat(payload.amount)
    payload.participants = payload.participants.split(',').map(s=>s.trim()).filter(Boolean)
    const res = await fetch(`${backendURL}/expenses`, { method:'POST', headers: await authHeaders(), body: JSON.stringify(payload) })
    if(res.ok){
      await refreshExpenses(payload.group_id)
      await refreshInsights(payload.group_id)
      socket.emit('expense:new', { ...payload })
      e.target.reset()
    }
  }

  async function handleOCR(e){
    const file = e.target.files?.[0]
    if(!file) return
    const { data } = await Tesseract.recognize(file, 'eng')
    alert(`OCR result: ${data.text.substring(0,120)}...`)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">TravelSplit AI</h1>
        <div className="text-sm text-white/70">Backend: {backendURL}</div>
      </header>

      {!group && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold mb-3">Create a group</h3>
            <div className="flex gap-2">
              <input value={groupName} onChange={e=>setGroupName(e.target.value)} className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg" placeholder="Trip name" />
              <button onClick={createGroup} className="px-4 rounded-lg bg-white text-black font-semibold">Create</button>
            </div>
          </div>
          <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold mb-3">Join with a code</h3>
            <div className="flex gap-2">
              <input value={groupCode} onChange={e=>setGroupCode(e.target.value)} className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg" placeholder="Enter code" />
              <button onClick={joinGroup} className="px-4 rounded-lg bg-white text-black font-semibold">Join</button>
            </div>
          </div>
        </div>
      )}

      {group && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
              <h3 className="font-semibold">Add expense</h3>
              <form onSubmit={handleAddExpense} className="mt-3 grid md:grid-cols-2 gap-3">
                <input name="group_id" defaultValue={group._id} hidden readOnly />
                <input name="title" placeholder="Title" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg" required />
                <input name="amount" type="number" step="0.01" placeholder="Amount" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg" required />
                <input name="currency" defaultValue="USD" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg" />
                <select name="category" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg">
                  <option>food</option>
                  <option>stay</option>
                  <option>travel</option>
                  <option>misc</option>
                </select>
                <input name="payer_id" placeholder="Payer user id" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg" required />
                <input name="participants" placeholder="Comma-separated participant ids" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg" required />
                <input name="notes" placeholder="Notes (optional)" className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg md:col-span-2" />
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleOCR} className="text-sm" />
                  <span className="text-white/60 text-sm">Use OCR to auto-read receipts</span>
                </div>
                <div className="md:col-span-2">
                  <button className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold">Add Expense</button>
                </div>
              </form>
            </div>
            <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
              <h3 className="font-semibold mb-3">Expenses</h3>
              <div className="space-y-2">
                {expenses.map(e=> (
                  <div key={e._id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-white/60">{e.category} • {e.currency} {e.amount}</div>
                    </div>
                    <div className="text-sm text-white/70">Payer: {e.payer_id}</div>
                  </div>
                ))}
                {expenses.length===0 && <div className="text-white/60">No expenses yet.</div>}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
              <h3 className="font-semibold mb-2">Group</h3>
              <div className="text-sm text-white/80">{group.name}</div>
              <div className="text-xs text-white/60 mt-1">Code: {group.code}</div>
            </div>
            <div className="p-5 border border-white/10 rounded-xl bg-white/[0.03]">
              <h3 className="font-semibold mb-2">Insights</h3>
              {insights ? (
                <div className="text-sm space-y-1">
                  <div>Total: {insights.total}</div>
                  <div>Top spender: {insights.top_spender || '—'}</div>
                </div>
              ) : <div className="text-white/60 text-sm">No data yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
