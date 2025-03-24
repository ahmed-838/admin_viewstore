import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Config from '@/config/Config'; 

const UpdateProduct = () => {
  // حالات لعرض المنتجات وفلترتها
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [message, setMessage] = useState('');
  
  // إضافة حالات جديدة لتحديث المنتج
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    isActive: true,
    sizes: [],
    colors: []
  });
  const [updating, setUpdating] = useState(false);
  // إضافة حالة جديدة للتحكم في ظهور الرسائل
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // استدعاء المنتجات عند تحميل الصفحة
  useEffect(() => {
    fetchProducts();
  }, []);

  // تحديث المنتجات المفلترة عند تغيير التصنيف المحدد
  useEffect(() => {
    filterProductsByCategory();
  }, [selectedCategory, products]);

  // دالة لجلب المنتجات من قاعدة البيانات
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${Config.API_BASE_URL}/api/products`);
      const productsList = response.data.products;
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      showNotification(`خطأ في جلب المنتجات: ${error.message}`, 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  // دالة لفلترة المنتجات حسب التصنيف
  const filterProductsByCategory = () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  };

  // دالة لتغيير التصنيف المحدد
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  // دالة لحذف المنتج
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      try {
        // الحصول على التوكن من التخزين المحلي
        const token = localStorage.getItem('token');
        
        if (!token) {
          showNotification('لم يتم العثور على توكن المصادقة. يرجى تسجيل الدخول مرة أخرى.', 'error');
          return;
        }
        
        // إعداد رأس الطلب مع توكن المصادقة
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        };
        
        await axios.delete(`${Config.API_BASE_URL}/api/products/${productId}`, config);
        showNotification('تم حذف المنتج بنجاح');
        // تحديث قائمة المنتجات بعد الحذف
        fetchProducts();
      } catch (error) {
        console.error("خطأ في حذف المنتج:", error);
        
        // التعامل مع أخطاء المصادقة
        if (error.response && error.response.status === 401) {
          showNotification('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.', 'error');
        } else {
          showNotification(`خطأ في حذف المنتج: ${error.message}`, 'error');
        }
      }
    }
  };

  // دالة للانتقال إلى صفحة تحديث المنتج
  const handleUpdateProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setUpdatedProduct({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        isActive: product.isActive,
        sizes: [...product.sizes],
        colors: [...product.colors]
      });
      setIsUpdateModalOpen(true);
    }
  };

  // دالة لإغلاق نموذج التحديث
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedProduct(null);
  };

  // دالة لتحديث قيم المنتج
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setUpdatedProduct({ ...updatedProduct, [name]: checked });
    } else {
      setUpdatedProduct({ ...updatedProduct, [name]: value });
    }
  };

  // دالة لتحديث المصفوفات (الألوان والمقاسات)
  const handleArrayChange = (type, value, isChecked) => {
    if (isChecked) {
      setUpdatedProduct({
        ...updatedProduct,
        [type]: [...updatedProduct[type], value]
      });
    } else {
      setUpdatedProduct({
        ...updatedProduct,
        [type]: updatedProduct[type].filter(item => item !== value)
      });
    }
  };

  // دالة لتحديث المنتج
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // الحصول على التوكن من التخزين المحلي
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('لم يتم العثور على توكن المصادقة. يرجى تسجيل الدخول مرة أخرى.', 'error');
        return;
      }
      
      // إعداد رأس الطلب مع توكن المصادقة
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      };
      
      // إرسال طلب التحديث مع التوكن
      const response = await axios.put(
        `${Config.API_BASE_URL}/api/products/${selectedProduct._id}`,
        updatedProduct,
        config
      );
      
      showNotification('تم تحديث المنتج بنجاح');
      setIsUpdateModalOpen(false);
      fetchProducts(); // تحديث قائمة المنتجات
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      
      // التعامل مع أخطاء المصادقة
      if (error.response && error.response.status === 401) {
        showNotification('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.', 'error');
      } else {
        showNotification(`خطأ في تحديث المنتج: ${error.message}`, 'error');
      }
    } finally {
      setUpdating(false);
    }
  };

  // تعديل دالة عرض الرسائل
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // إخفاء الرسالة تلقائياً بعد 5 ثواني
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  return (
    <div className="rtl container mx-auto p-6 bg-gray-50 text-black rounded-lg shadow-sm">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-r-4 border-black pr-3">عرض المنتجات</h2>
      
      {/* مكون الإشعارات الجديد */}
      {notification.show && (
        <div 
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-4 rtl:space-x-reverse min-w-[300px] animate-fade-in-down ${
            notification.type === 'error' 
              ? 'bg-red-50 text-red-700 border-r-4 border-red-500' 
              : 'bg-green-50 text-green-700 border-r-4 border-green-500'
          }`}
        >
          <div className="shrink-0">
            {notification.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3 rtl:ml-0 rtl:mr-3">
            <p className="font-medium">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification({ ...notification, show: false })}
            className="shrink-0 mr-auto rtl:mr-0 rtl:ml-auto text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      {/* قسم عرض وفلترة المنتجات */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">قائمة المنتجات</h3>
        
        {/* أزرار الفلترة */}
        <div className="mb-8">
          <h4 className="mb-3 text-lg font-medium text-gray-700">تصفية حسب الفئة:</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'all' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              الكل
            </button>
            <button
              onClick={() => handleCategoryFilter('pants')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'pants' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              بنطلون
            </button>
            <button
              onClick={() => handleCategoryFilter('shirts')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'shirts' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              تيشيرت
            </button>
            <button
              onClick={() => handleCategoryFilter('hoodies')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'hoodies' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              هوديز
            </button>
            
            <button
              onClick={() => handleCategoryFilter('undershirt')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'undershirt' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
            فانلة داخلي
            </button>
            
            <button
              onClick={() => handleCategoryFilter('underwear')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'underwear' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              طقم داخلي
            </button>

            <button
              onClick={() => handleCategoryFilter('boxers')}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${selectedCategory === 'boxers' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              بوكسر
            </button>
          </div>
        </div>
        
        {/* عرض المنتجات */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">جاري تحميل المنتجات...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => (
              <div key={item._id} className="border rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={`${Config.API_BASE_URL}${item.image}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.isActive ? 'متاح' : 'غير متاح'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{item.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {item.category === 'pants' && 'بنطلون'}
                      {item.category === 'shirts' && 'تيشيرت'}
                      {item.category === 'hoodies' && 'هوديز'}
                      {item.category === 'boxers' && 'بوكسر'}
                      {item.category === 'undershirt' && 'تيشيرت داخلي'}
                      {item.category === 'underwear' && 'طقم داخلي'}
                    </p>
                    <p className="font-bold text-xl text-black">{item.price} <span className="text-sm">جنيه</span></p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">المخزون: <span className="font-medium">{item.stock}</span> قطعة</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">المقاسات المتاحة:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.sizes && item.sizes.map(size => (
                        <span key={size} className="bg-gray-100 px-3 py-1 text-xs rounded-full text-gray-700">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">الألوان المتاحة:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.colors && item.colors.map(color => (
                        <span key={color} className="px-3 py-1 text-xs rounded-full border text-gray-700">
                          {color === 'black' && 'أسود'}
                          {color === 'white' && 'أبيض'}
                          {color === 'red' && 'أحمر'}
                          {color === 'blue' && 'أزرق'}
                          {color === 'green' && 'أخضر'}
                          {color === 'yellow' && 'أصفر'}
                          {color === 'gray' && 'رمادي'}
                          {color === 'brown' && 'بني'}
                          {color === 'navy' && 'كحلي'}
                          {color === 'beige' && 'بيج'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button 
                      onClick={() => handleUpdateProduct(item._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      تعديل
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(item._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">لا توجد منتجات في هذه الفئة</p>
          </div>
        )}
      </div>
      
      {/* نموذج تحديث المنتج */}
      {isUpdateModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">تحديث المنتج: {selectedProduct.name}</h3>
              <button 
                onClick={closeUpdateModal}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">اسم المنتج</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedProduct.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">السعر (جنيه)</label>
                  <input
                    type="number"
                    name="price"
                    value={updatedProduct.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">المخزون</label>
                  <input
                    type="number"
                    name="stock"
                    value={updatedProduct.stock}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">الفئة</label>
                  <select
                    name="category"
                    value={updatedProduct.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  >
                    <option value="pants">بنطلون</option>
                    <option value="shirts">تيشيرت</option>
                    <option value="hoodies">هوديز</option>
                    <option value="boxers">بوكسر</option>
                    <option value="undershirt">تيشيرت داخلية</option>
                    <option value="underwear">طقم داخلي</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={updatedProduct.isActive}
                    onChange={handleInputChange}
                    className="ml-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="font-medium text-gray-700">متاح للبيع</label>
                </div>
              </div>
              
              <div className="border-t border-b py-6">
                <label className="block mb-3 font-medium text-gray-700">المقاسات المتاحة</label>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL','5XL'].map(size => (
                    <label key={size} className="flex items-center border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={updatedProduct.sizes.includes(size)}
                        onChange={(e) => handleArrayChange('sizes', size, e.target.checked)}
                        className="ml-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-3 font-medium text-gray-700">الألوان المتاحة</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'black', label: 'أسود' },
                    { value: 'white', label: 'أبيض' },
                    { value: 'red', label: 'أحمر' },
                    { value: 'blue', label: 'أزرق' },
                    { value: 'green', label: 'أخضر' },
                    { value: 'yellow', label: 'أصفر' },
                    { value: 'gray', label: 'رمادي' },
                    { value: 'brown', label: 'بني' },
                    { value: 'navy', label: 'كحلي' },
                    { value: 'beige', label: 'بيج' }
                  ].map(color => (
                    <label key={color.value} className="flex items-center border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={updatedProduct.colors.includes(color.value)}
                        onChange={(e) => handleArrayChange('colors', color.value, e.target.checked)}
                        className="ml-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      {color.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 font-medium transition-colors shadow-sm hover:shadow"
                  disabled={updating}
                >
                  {updating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التحديث...
                    </span>
                  ) : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;
