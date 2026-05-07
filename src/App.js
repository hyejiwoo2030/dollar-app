// Vercel 강제 업데이트용 메모
// Vercel 강제 업데이트용 메모
// App.js 전체 코드 (진행+매도 탭 통합 및 데이터 가시성 강화 버전)
import React, { useState, useEffect } from 'react';

// ==========================================
// 1. 기본 설정 (시트 정보)
// ==========================================
const SPREADSHEET_ID = '1jdeLSnARQwKgnXgdCTkuQYbzfIfQswMtBBKxYbfK22Y';
const CLIENT_ID = '232502345048-6norj2n7j1s5ohhftrbpt0hanea7fcbk.apps.googleusercontent.com';

// ==========================================
// 2. 메인 화면 
// ==========================================
function DollarInvestApp() {
  const [activeTab, setActiveTab] = useState('buy'); 
  const [accessToken, setAccessToken] = useState(null); 
  const [buyData, setBuyData] = useState([]); 
  const [sellData, setSellData] = useState([]); 

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        
        const fetchData = async () => {
          try {
            const buyRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매수기록!A3:J`, { headers: { Authorization: `Bearer ${token}` } });
            const sellRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매도기록!A3:G`, { headers: { Authorization: `Bearer ${token}` } });
            const buyJson = await buyRes.json();
            const sellJson = await sellRes.json();

            // 콤마 제거 필터 유지
            const removeComma = (val) => typeof val === 'string' ? val.replace(/,/g, '') : val;

            setBuyData(buyJson.values ? buyJson.values.filter(r => r[0] && r[0].trim() !== '').map(row => row.map(removeComma)) : []); 
            setSellData(sellJson.values ? sellJson.values.filter(r => r[0] && r[0].trim() !== '').map(row => row.map(removeComma)) : []);
          } catch (error) { console.error("데이터 읽기 실패", error); }
        };
        fetchData();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const fetchSheetData = async (token) => {
    try {
      const buyRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매수기록!A3:J`, { headers: { Authorization: `Bearer ${token}` } });
      const sellRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매도기록!A3:G`, { headers: { Authorization: `Bearer ${token}` } });
      const buyJson = await buyRes.json();
      const sellJson = await sellRes.json();

      const removeComma = (val) => typeof val === 'string' ? val.replace(/,/g, '') : val;

      setBuyData(buyJson.values ? buyJson.values.filter(r => r[0] && r[0].trim() !== '').map(row => row.map(removeComma)) : []); 
      setSellData(sellJson.values ? sellJson.values.filter(r => r[0] && r[0].trim() !== '').map(row => row.map(removeComma)) : []);
    } catch (error) { console.error("데이터 읽기 실패", error); }
  };

  const calculateRemaining = (buyId, originalAmount) => {
    const relatedSells = sellData.filter(sell => sell[0] === buyId); 
    const totalSold = relatedSells.reduce((sum, sell) => sum + parseFloat(sell[3] || 0), 0);
    return parseFloat(originalAmount) - totalSold;
  };

  const handleDirectLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${window.location.origin}&response_type=token&scope=https://www.googleapis.com/auth/spreadsheets`;
    window.location.href = authUrl;
  };

  if (!accessToken) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6F8', fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'NanumSquare', sans-serif" }}>
        <div style={{ padding: '50px 30px', backgroundColor: 'white', border: '1px solid #E3E5E8', borderRadius: '12px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px', color: '#111111', letterSpacing: '-1px' }}>💰달러환테크 대시보드</h1>
          <p style={{ fontSize: '15px', color: '#666666', marginBottom: '40px', letterSpacing: '-0.5px' }}>개인 시트 연동을 위해 로그인해 주세요</p>
          <button onClick={handleDirectLogin} style={{ width: '100%', padding: '16px', backgroundColor: '#03C75A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#F5F6F8', fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'NanumSquare', sans-serif" }}>
      <div style={{ backgroundColor: 'white', padding: '20px 20px 15px 20px', borderBottom: '1px solid #E3E5E8' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111111', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '6px' }}>💰</span>달러환테크 대시보드
        </h1>
      </div>
      
      {/* 탭에서 'sell'을 제거하고 active를 진행/매도로 변경 */}
      <div style={{ backgroundColor: 'white', display: 'flex', borderBottom: '1px solid #E3E5E8' }}>
        {['buy', 'active', 'completed', 'manage'].map((tab) => {
          const labels = { buy: '매수', active: '진행/매도', completed: '완료', manage: '관리' };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px 0', fontSize: '15px', fontWeight: isActive ? '700' : '500',
                backgroundColor: 'white', border: 'none', cursor: 'pointer', letterSpacing: '-0.5px',
                color: isActive ? '#03C75A' : '#777777',
                borderBottom: isActive ? '3px solid #03C75A' : '3px solid transparent',
                transition: 'all 0.1s ease-in-out', WebkitTapHighlightColor: 'transparent'
              }}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', border: '1px solid #E3E5E8', borderRadius: '12px' }}>
          {activeTab === 'buy' && <BuyTab token={accessToken} buyData={buyData} fetchSheetData={fetchSheetData} />}
          {activeTab === 'active' && <ActiveTab token={accessToken} buyData={buyData} sellData={sellData} calculateRemaining={calculateRemaining} fetchSheetData={fetchSheetData} />}
          {activeTab === 'completed' && <CompletedTab buyData={buyData} sellData={sellData} />}
          {activeTab === 'manage' && <ManageTab token={accessToken} buyData={buyData} sellData={sellData} fetchSheetData={fetchSheetData} />}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. 매수 입력 탭 (그대로 유지)
// ==========================================
function BuyTab({ token, buyData, fetchSheetData }) {
  const [formData, setFormData] = useState({ date: '', exchange: '', rate: '', amount: '', note: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateStr = formData.date.replace(/-/g, '').substring(2);
    const sameDayCount = buyData.filter(row => row[1] === formData.date && row[2] === formData.exchange).length;
    const sequence = String(sameDayCount + 1).padStart(2, '0');
    const newId = `${dateStr}-${formData.exchange}-${sequence}`;
    const krwAmount = Math.round(parseFloat(formData.rate) * parseFloat(formData.amount));
    const newRow = [newId, formData.date, formData.exchange, formData.rate, formData.amount, krwAmount, null, null, null, formData.note];

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매수기록!A:J:append?valueInputOption=USER_ENTERED`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [newRow] })
      });
      alert('매수 기록 저장 완료!');
      fetchSheetData(token); 
      setFormData({ date: '', exchange: '', rate: '', amount: '', note: '' }); 
    } catch (err) { alert('오류가 발생했습니다.'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h2 style={sectionTitleStyle}>신규 매수 등록</h2>
      <div style={inputGroupStyle}><label style={labelStyle}>매수일</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={inputStyle} /></div>
      <div style={inputGroupStyle}><label style={labelStyle}>거래소</label><input type="text" placeholder="예: 키움증권" required value={formData.exchange} onChange={e => setFormData({...formData, exchange: e.target.value})} style={inputStyle} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={inputGroupStyle}><label style={labelStyle}>환율 (원)</label><input type="number" step="0.01" required value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} style={inputStyle} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>달러 (USD)</label><input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={inputStyle} /></div>
      </div>
      <div style={inputGroupStyle}><label style={labelStyle}>비고</label><input type="text" placeholder="메모할 내용을 입력하세요" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} style={inputStyle} /></div>
      <button type="submit" style={primaryButtonStyle}>등록하기</button>
    </form>
  );
}

// ==========================================
// 4. 진행/매도 탭 (매도 기능과 리스트를 하나로 완벽 통합)
// ==========================================
function ActiveTab({ token, buyData, sellData, calculateRemaining, fetchSheetData }) {
  const activeItems = buyData.filter(buy => calculateRemaining(buy[0], buy[4]) > 0);
  const totalUsd = activeItems.reduce((sum, buy) => sum + calculateRemaining(buy[0], buy[4]), 0);
  const totalKrw = activeItems.reduce((sum, buy) => sum + (parseFloat(buy[3]) * calculateRemaining(buy[0], buy[4])), 0);
  
  // 아코디언 메뉴(입력창) 상태 관리
  const [sellingBuyId, setSellingBuyId] = useState(null);
  const [formData, setFormData] = useState({ date: '', rate: '', amount: '' });

  // 매도 버튼 클릭 시 작동하는 로직
  const handleSellSubmit = async (e, buyId, remainingUsd, buyRateStr) => {
    e.preventDefault();
    if (parseFloat(formData.amount) > remainingUsd) { alert(`잔여 ${remainingUsd}달러 초과 불가!`); return; }
    
    const buyRate = parseFloat(buyRateStr); 
    const sellRate = parseFloat(formData.rate);
    const sellAmountUsd = parseFloat(formData.amount);
    
    const krwSellAmount = Math.round(sellRate * sellAmountUsd); 
    const profitKrw = Math.round((sellRate - buyRate) * sellAmountUsd); 
    const yieldPercent = ((profitKrw / (buyRate * sellAmountUsd)) * 100).toFixed(2); 

    const newRow = [buyId, formData.date, formData.rate, formData.amount, krwSellAmount, profitKrw, yieldPercent];

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/매도기록!A:G:append?valueInputOption=USER_ENTERED`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [newRow] })
      });
      alert('매도 기록 저장 완료!');
      fetchSheetData(token);
      setFormData({ date: '', rate: '', amount: '' });
      setSellingBuyId(null); // 입력창 닫기
    } catch (err) { alert('오류가 발생했습니다.'); }
  };

  return (
    <div>
      <h2 style={sectionTitleStyle}>진행중인 투자 및 매도</h2>
      <div style={summaryBoxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>총 보유 달러</span>
          <strong style={{ fontSize: '18px', color: '#111111' }}>${totalUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>총 매수 원금</span>
          <strong style={{ fontSize: '18px', color: '#111111' }}>{Math.round(totalKrw).toLocaleString()}원</strong>
        </div>
      </div>
      
      {/* 2줄 스태킹 레이아웃 적용 및 거래소 정보 추가 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>매수일/거래소</th>
              <th style={thStyle}>매수환율</th>
              <th style={{...thStyle, textAlign: 'right'}}>잔여달러/작업</th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((buy) => {
              const buyId = buy[0];
              const buyDate = buy[1];
              const exchange = buy[2];
              const buyRate = buy[3];
              const remainingUsd = calculateRemaining(buyId, buy[4]);
              const isSelling = sellingBuyId === buyId;

              return (
                <React.Fragment key={buyId}>
                  <tr style={{ borderBottom: isSelling ? 'none' : '1px solid #EAECEE', backgroundColor: isSelling ? '#F9F9FB' : 'white' }}>
                    <td style={{...tdStyle, padding: '14px 4px'}}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{buyDate}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{exchange}</div>
                    </td>
                    <td style={{...tdStyle, fontWeight: '600', padding: '14px 4px'}}>{buyRate}원</td>
                    <td style={{...tdStyle, textAlign: 'right', padding: '14px 4px'}}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#03C75A', marginBottom: '6px' }}>${remainingUsd.toFixed(2)}</div>
                      <button 
                        onClick={() => {
                          setSellingBuyId(isSelling ? null : buyId);
                          setFormData({ date: '', rate: '', amount: '' }); // 다른 건 열 때 폼 초기화
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', backgroundColor: isSelling ? '#EAECEE' : '#03C75A', color: isSelling ? '#555' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {isSelling ? '취소' : '매도'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* 숨겨진 확장형(아코디언) 매도 입력창 */}
                  {isSelling && (
                    <tr style={{ borderBottom: '1px solid #EAECEE', backgroundColor: '#F9F9FB' }}>
                      <td colSpan="3" style={{ padding: '0 10px 20px 10px' }}>
                        <form onSubmit={(e) => handleSellSubmit(e, buyId, remainingUsd, buyRate)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #DADCE0', borderRadius: '8px' }}>
                          <div style={inputGroupStyle}><label style={{...labelStyle, fontSize: '12px'}}>매도일</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{...inputStyle, padding: '10px'}} /></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={inputGroupStyle}><label style={{...labelStyle, fontSize: '12px'}}>매도 환율</label><input type="number" step="0.01" placeholder="예: 1450" required value={formData.date ? formData.rate : ''} onChange={e => setFormData({...formData, rate: e.target.value})} style={{...inputStyle, padding: '10px'}} /></div>
                            <div style={inputGroupStyle}><label style={{...labelStyle, fontSize: '12px'}}>팔 달러 (최대 ${remainingUsd.toFixed(2)})</label><input type="number" step="0.01" max={remainingUsd} placeholder={`최대 ${remainingUsd}`} required value={formData.date ? formData.amount : ''} onChange={e => setFormData({...formData, amount: e.target.value})} style={{...inputStyle, padding: '10px'}} /></div>
                          </div>
                          <button type="submit" style={{...primaryButtonStyle, padding: '12px', marginTop: '4px'}}>저장하기</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 5. 투자완료 탭 (매수/매도 정보 1:1 비교 추가)
// ==========================================
function CompletedTab({ buyData, sellData }) {
  const today = new Date();
  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [filterMode, setFilterMode] = useState('yearly');
  const [filterYear, setFilterYear] = useState(yyyy);
  const [filterMonth, setFilterMonth] = useState(`${yyyy}-${mm}`);
  const [filterDate, setFilterDate] = useState(todayStr);
  const [customStart, setCustomStart] = useState(`${yyyy}-01-01`);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const allCompletedRecords = sellData.map(sell => {
    const matchedBuy = buyData.find(buy => buy[0] === sell[0]) || [];
    const buyRate = parseFloat(matchedBuy[3] || 0);
    const sellRate = parseFloat(sell[2] || 0);
    const sellUsd = parseFloat(sell[3] || 0);
    const profit = (sellRate - buyRate) * sellUsd;
    const invested = buyRate * sellUsd;
    return {
      id: sell[0],
      sellDate: sell[1] || '',
      buyDate: matchedBuy[1] || '-', // 매수일 추가
      buyRate: matchedBuy[3] || '0', // 매수환율 추가
      sellRate: sell[2],
      sellUsd: sell[3],
      profit: profit,
      invested: invested
    };
  });

  const filteredRecords = allCompletedRecords.filter(record => {
    const sDate = record.sellDate;
    if (!sDate) return false;
    if (filterMode === 'all') return true;
    if (filterMode === 'yearly') return sDate.startsWith(filterYear);
    if (filterMode === 'monthly') return sDate.startsWith(filterMonth);
    if (filterMode === 'daily') return sDate === filterDate;
    if (filterMode === 'custom') return sDate >= customStart && sDate <= customEnd;
    return true;
  });

  let totalProfit = 0;
  let totalInvestedForSold = 0;
  filteredRecords.forEach(record => {
    totalProfit += record.profit;
    totalInvestedForSold += record.invested;
  });

  const isProfit = totalProfit >= 0;
  const mainColor = isProfit ? '#F33140' : '#0F62FE';

  let rangeText = "";
  if (filterMode === 'all') rangeText = "전체 기간 누적 데이터";
  else if (filterMode === 'yearly') rangeText = `${filterYear}.01.01 ~ ${filterYear === yyyy ? todayStr.replace(/-/g, '.') : filterYear + '.12.31'}`;
  else if (filterMode === 'monthly') rangeText = `${filterMonth.replace('-', '.')}.01 ~ 해당 월 말일`;
  else if (filterMode === 'daily') rangeText = `${filterDate.replace(/-/g, '.')}`;
  else if (filterMode === 'custom') rangeText = `${customStart.replace(/-/g, '.')} ~ ${customEnd.replace(/-/g, '.')}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: '0' }}>투자 수익 요약</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', backgroundColor: '#FAFAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E3E5E8' }}>
        <select value={filterMode} onChange={e => setFilterMode(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #DADCE0', outline: 'none', backgroundColor: 'white' }}>
          <option value="yearly">연별</option><option value="monthly">월별</option><option value="daily">일별</option><option value="custom">직접설정</option><option value="all">누적 (전체)</option>
        </select>
        {filterMode === 'yearly' && (<input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #DADCE0' }} />)}
        {filterMode === 'monthly' && (<input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #DADCE0' }} />)}
        {filterMode === 'daily' && (<input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #DADCE0' }} />)}
        {filterMode === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #DADCE0' }} /><span style={{ color: '#666' }}>~</span><input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #DADCE0' }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '12px', color: '#888888', marginBottom: '15px', letterSpacing: '-0.5px' }}>조회 기간 : {rangeText}</div>
      <div style={{...summaryBoxStyle, backgroundColor: isProfit ? '#FFF8F8' : '#F5F8FF', borderColor: isProfit ? '#FFE2E5' : '#E5EEFF', marginBottom: '25px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#444444', fontSize: '14px', fontWeight: '600' }}>해당 기간 실현 수익금</span>
          <strong style={{ fontSize: '22px', color: mainColor, letterSpacing: '-0.5px' }}>{totalProfit > 0 ? '+' : ''}{Math.round(totalProfit).toLocaleString()}원</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#666666', fontSize: '14px' }}>해당 기간 수익률</span>
          <strong style={{ fontSize: '16px', color: mainColor }}>{totalInvestedForSold ? ((totalProfit / totalInvestedForSold) * 100).toFixed(2) : 0}%</strong>
        </div>
      </div>
      
      {/* 매수/매도 비교를 위한 3컬럼 스태킹 레이아웃 적용 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...thStyle, width: '30%'}}>매수정보</th>
              <th style={{...thStyle, width: '30%'}}>매도정보</th>
              <th style={{...thStyle, width: '40%', textAlign: 'right'}}>달러/수익금</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>해당 기간에 매도 기록이 없습니다.</td></tr>
            ) : (
              filteredRecords.map((record, idx) => (
                <tr key={idx} style={trStyle}>
                  {/* 매수 정보 */}
                  <td style={{...tdStyle, padding: '14px 4px'}}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{record.buyDate}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{record.buyRate}원</div>
                  </td>
                  {/* 매도 정보 */}
                  <td style={{...tdStyle, padding: '14px 4px'}}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{record.sellDate}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{record.sellRate}원</div>
                  </td>
                  {/* 달러 및 수익금 */}
                  <td style={{...tdStyle, textAlign: 'right', padding: '14px 4px'}}>
                    <div style={{ fontSize: '12px', color: '#03C75A', fontWeight: '600', marginBottom: '4px' }}>${record.sellUsd}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: record.profit >= 0 ? '#F33140' : '#0F62FE'}}>
                      {record.profit > 0 ? '+' : ''}{Math.round(record.profit).toLocaleString()}원
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 6. 기록 관리 탭
// ==========================================
function ManageTab({ token, buyData, sellData, fetchSheetData }) {
  const handleDelete = async (type, id, indexInArray) => {
    if (!window.confirm(`이 기록을 삭제하시겠습니까?`)) return;
    const rowIndex = indexInArray + 3;
    const sheetName = type === 'buy' ? '매수기록' : '매도기록';
    const range = type === 'buy' ? `A${rowIndex}:J${rowIndex}` : `A${rowIndex}:G${rowIndex}`;
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!${range}:clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchSheetData(token);
    } catch (err) { alert('삭제 실패'); }
  };

  const handleEdit = async (type, rowData, indexInArray) => {
    const rowIndex = indexInArray + 3;
    const sheetName = type === 'buy' ? '매수기록' : '매도기록';
    const range = type === 'buy' ? `A${rowIndex}:J${rowIndex}` : `A${rowIndex}:G${rowIndex}`;
    const newRate = window.prompt(`새 환율 입력 (기존: ${type === 'buy' ? rowData[3] : rowData[2]})`, type === 'buy' ? rowData[3] : rowData[2]);
    if (!newRate) return;
    const newAmount = window.prompt(`새 달러 입력 (기존: ${type === 'buy' ? rowData[4] : rowData[3]})`, type === 'buy' ? rowData[4] : rowData[3]);
    if (!newAmount) return;

    let updatedRow = [...rowData];
    if (type === 'buy') {
      updatedRow[3] = newRate; updatedRow[4] = newAmount;
      updatedRow[5] = Math.round(parseFloat(newRate) * parseFloat(newAmount));
      updatedRow[6] = null; updatedRow[7] = null; updatedRow[8] = null;
    } else {
      updatedRow[2] = newRate; updatedRow[3] = newAmount;
      const targetBuy = buyData.find(b => b[0] === rowData[0]);
      if (targetBuy) {
        updatedRow[4] = Math.round(parseFloat(newRate) * parseFloat(newAmount));
        updatedRow[5] = Math.round((parseFloat(newRate) - parseFloat(targetBuy[3])) * parseFloat(newAmount));
        updatedRow[6] = ((updatedRow[5] / (parseFloat(targetBuy[3]) * parseFloat(newAmount))) * 100).toFixed(2);
      }
    }
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [updatedRow] })
      });
      fetchSheetData(token);
    } catch (err) { alert('수정 실패'); }
  };

  return (
    <div>
      <h2 style={{...sectionTitleStyle, color: '#111111'}}>매수 내역</h2>
      <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>상세정보</th><th style={{...thStyle, textAlign: 'right'}}>편집</th></tr></thead>
          <tbody>
            {buyData.map((buy, idx) => (
              <tr key={`buy-${idx}`} style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>{buy[0]}</div>
                  <div style={{ fontSize: '15px', color: '#111111', fontWeight: '600' }}>{buy[3]}원 / <span style={{color: '#03C75A'}}>${buy[4]}</span></div>
                </td>
                <td style={{...tdStyle, textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button onClick={() => handleEdit('buy', buy, idx)} style={editBtnStyle}>수정</button>
                  <button onClick={() => handleDelete('buy', buy[0], idx)} style={deleteBtnStyle}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 style={{...sectionTitleStyle, color: '#111111'}}>매도 내역</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>상세정보</th><th style={{...thStyle, textAlign: 'right'}}>편집</th></tr></thead>
          <tbody>
            {sellData.map((sell, idx) => (
              <tr key={`sell-${idx}`} style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>연결: {sell[0]}</div>
                  <div style={{ fontSize: '15px', color: '#111111', fontWeight: '600' }}>{sell[2]}원 / <span style={{color: '#03C75A'}}>${sell[3]}</span></div>
                </td>
                <td style={{...tdStyle, textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button onClick={() => handleEdit('sell', sell, idx)} style={editBtnStyle}>수정</button>
                  <button onClick={() => handleDelete('sell', sell[0], idx)} style={deleteBtnStyle}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 7. 공통 디자인 시스템
// ==========================================
const sectionTitleStyle = { fontSize: '17px', fontWeight: '800', color: '#111111', marginBottom: '20px', letterSpacing: '-0.5px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#333333' };
const inputStyle = { width: '100%', padding: '14px', backgroundColor: '#FFFFFF', border: '1px solid #DADCE0', borderRadius: '6px', fontSize: '15px', color: '#111111', boxSizing: 'border-box' };
const primaryButtonStyle = { width: '100%', padding: '16px', backgroundColor: '#03C75A', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '16px', marginTop: '10px' };
const disabledButtonStyle = { ...primaryButtonStyle, backgroundColor: '#EAECEE', color: '#A0A0A0', cursor: 'not-allowed' };
const summaryBoxStyle = { padding: '20px', backgroundColor: '#FAFAFB', border: '1px solid #E3E5E8', borderRadius: '8px', marginBottom: '10px' };
const tableStyle = { width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' };
const thStyle = { padding: '0 0 12px 0', borderBottom: '2px solid #111111', color: '#111111', fontWeight: '700', fontSize: '13px', letterSpacing: '-0.5px' };
const trStyle = { borderBottom: '1px solid #EAECEE' };
const tdStyle = { padding: '16px 0', color: '#333333' };
const editBtnStyle = { padding: '7px 14px', backgroundColor: '#FFFFFF', color: '#444444', border: '1px solid #DADCE0', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '13px', fontWeight: '600' };
const deleteBtnStyle = { padding: '7px 14px', backgroundColor: '#FFFFFF', color: '#F33140', border: '1px solid #F33140', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

export default function Root() {
  return <DollarInvestApp />;
}