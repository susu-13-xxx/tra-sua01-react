import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const menuList = [
    { id: 1, name: 'Trà Sữa Trân Châu Đường Đen', price: 30000, img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=300' },
    { id: 2, name: 'Trà Sữa Thái Xanh Kem Béo', price: 28000, img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300' },
    { id: 3, name: 'Trà Ô Long Milk Foam', price: 35000, img: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300' },
  ]

  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('menu')
  const [selectedItem, setSelectedItem] = useState(null)
  const [sweetness, setSweetness] = useState('100%')
  const [ice, setIce] = useState('100%')
  const [topping, setTopping] = useState([])

  // Hàm lấy danh sách đơn hàng từ Backend Node.js
  const fetchOrdersFromBackend = async () => {
    try {
      const res = await fetch('https://tra-sua.onrender.com/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error('Lỗi lấy đơn hàng từ Server:', err)
    }
  }

  // Tự động gọi Backend lấy danh sách đơn khi mở web
  useEffect(() => {
    fetchOrdersFromBackend()
  }, [])

  const openCustomizer = (item) => {
    setSelectedItem(item)
    setSweetness('100%')
    setIce('100%')
    setTopping([])
  }

  const handleToppingChange = (topName) => {
    if (topping.includes(topName)) {
      setTopping(topping.filter((t) => t !== topName))
    } else {
      setTopping([...topping, topName])
    }
  }

  const handleAddToCart = () => {
    const finalPrice = selectedItem.price + topping.length * 5000
    const newItem = {
      ...selectedItem,
      sweetness,
      ice,
      topping,
      totalPrice: finalPrice,
      cartId: Date.now(),
    }
    setCart([...cart, newItem])
    setSelectedItem(null)
  }

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId))
  }

  // GỬI ĐƠN HÀNG SANG BACKEND NODE.JS
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return alert('Giỏ hàng trống cậu ơi!')

    const orderData = {
      items: cart,
      totalAmount: cart.reduce((sum, item) => sum + item.totalPrice, 0),
    }

    try {
      const res = await fetch('https://tra-sua.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        alert('🚀 Đặt hàng thành công! Đơn đã được gửi trực tiếp lên Server Backend!')
        setCart([])
        fetchOrdersFromBackend() // Cập nhật lại danh sách đơn hàng
      }
    } catch (err) {
      alert('❌ Không gửi được đơn hàng lên Server, cậu kiểm tra xem server backend đã chạy chưa nhé!')
    }
  }

  // ĐỔI TRẠNG THÁI ĐƠN HÀNG TRÊN BACKEND
  const toggleOrderStatus = async (orderId) => {
    try {
      await fetch(`https://tra-sua.onrender.com/api/orders/${orderId}`, { method: 'PUT' })
      fetchOrdersFromBackend()
    } catch (err) {
      console.error('Lỗi đổi trạng thái:', err)
    }
  }

  // XÓA ĐƠN HÀNG TRÊN BACKEND
  const deleteOrder = async (orderId) => {
    try {
      await fetch(`https://tra-sua.onrender.com/api/orders/${orderId}`, { method: 'DELETE' })
      fetchOrdersFromBackend()
    } catch (err) {
      console.error('Lỗi xóa đơn:', err)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => setTab('menu')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: tab === 'menu' ? '#6f4e37' : '#ddd', color: tab === 'menu' ? '#fff' : '#000' }}
        >
          🛒 Trang Đặt Hàng ({cart.length})
        </button>
        <button 
          onClick={() => { setTab('admin'); fetchOrdersFromBackend(); }}
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: tab === 'admin' ? '#6f4e37' : '#ddd', color: tab === 'admin' ? '#fff' : '#000' }}
        >
          👑 Trang Quản Lý Admin ({orders.length})
        </button>
      </div>

      {tab === 'menu' && (
        <>
          <h1 style={{ textAlign: 'center', color: '#6f4e37' }}>🧋 Tiệm Trà Sữa ReactJS + Node.js 🧋</h1>

          <h2>📋 Danh Sách Món</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {menuList.map((item) => (
              <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                <img src={item.img} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                <h3>{item.name}</h3>
                <p style={{ color: '#e67e22', fontWeight: 'bold' }}>{item.price.toLocaleString()} VNĐ</p>
                <button onClick={() => openCustomizer(item)} style={{ backgroundColor: '#6f4e37', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Chọn Món ✨
                </button>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '40px' }}>🛒 Giỏ Hàng Của Bạn</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#888' }}>Giỏ hàng chưa có món nào hết nha!</p>
          ) : (
            <div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.map((item) => (
                  <li key={item.cartId} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{item.name}</strong> - {item.totalPrice.toLocaleString()} VNĐ
                      <br />
                      <small style={{ color: '#666' }}>
                        Đường: {item.sweetness} | Đá: {item.ice} {item.topping.length > 0 && `| Topping: ${item.topping.join(', ')}`}
                      </small>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <h3 style={{ color: '#27ae60' }}>
                  Tổng Tiền: {cart.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()} VNĐ
                </h3>
                <button onClick={handlePlaceOrder} style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                  🚀 Đặt Hàng Ngay (Gửi lên Server)
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'admin' && (
        <div>
          <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>👑 Quản Lý Đơn Hàng từ Server Node.js</h1>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Chưa có đơn hàng nào trên Server!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
                    <strong>Mã đơn: #{order.id}</strong>
                    <small>Thời gian: {order.createdAt}</small>
                  </div>

                  <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} ({item.sweetness} đường, {item.ice} đá) {item.topping.length > 0 && `+ [${item.topping.join(', ')}]`} - {item.totalPrice.toLocaleString()}đ
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div>
                      <strong>Tổng: <span style={{ color: '#e67e22' }}>{order.totalAmount.toLocaleString()} VNĐ</span></strong> | 
                      Trạng thái: <strong>{order.status}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => toggleOrderStatus(order.id)} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#3498db', color: '#fff' }}>
                        Đổi trạng thái
                      </button>
                      <button onClick={() => deleteOrder(order.id)} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#e74c3c', color: '#fff' }}>
                        Xóa đơn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3>Tùy Chỉnh: {selectedItem.name}</h3>

            <div>
              <h4>Độ Ngọt:</h4>
              {['100%', '70%', '50%', '0%'].map((val) => (
                <label key={val} style={{ marginRight: '10px' }}>
                  <input type="radio" name="sweetness" checked={sweetness === val} onChange={() => setSweetness(val)} /> {val}
                </label>
              ))}
            </div>

            <div>
              <h4>Độ Đá:</h4>
              {['100%', '50%', 'Không đá'].map((val) => (
                <label key={val} style={{ marginRight: '10px' }}>
                  <input type="radio" name="ice" checked={ice === val} onChange={() => setIce(val)} /> {val}
                </label>
              ))}
            </div>

            <div>
              <h4>Topping (+5.000đ/loại):</h4>
              {['Trân Châu Đen', 'Thạch Trái Cây', 'Pudding Egg'].map((top) => (
                <label key={top} style={{ display: 'block', marginBottom: '5px' }}>
                  <input type="checkbox" checked={topping.includes(top)} onChange={() => handleToppingChange(top)} /> {top}
                </label>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedItem(null)} style={{ padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleAddToCart} style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                Thêm Vào Giỏ ({(selectedItem.price + topping.length * 5000).toLocaleString()}đ)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App