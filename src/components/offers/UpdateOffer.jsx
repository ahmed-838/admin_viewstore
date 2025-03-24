import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Config from '@/config/Config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateOffer = () => {
  // حالات لعرض العروض
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  
  // إضافة حالات لتحديث العرض
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [updatedOffer, setUpdatedOffer] = useState({
    name: '',
    oldPrice: 0,
    newPrice: 0,
    description: '',
    sizes: [],
    colors: []
  });
  const [updating, setUpdating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // استدعاء العروض عند تحميل الصفحة
  useEffect(() => {
    fetchOffers();
  }, []);

  // دالة لجلب العروض من قاعدة البيانات
  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const response = await axios.get(`${Config.API_BASE_URL}/api/offers`);
      setOffers(response.data);
    } catch (error) {
      console.error("خطأ في جلب العروض:", error);
      toast.error(`خطأ في جلب العروض: ${error.message}`);
    } finally {
      setLoadingOffers(false);
    }
  };

  // دالة لحذف العرض
  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العرض؟')) {
      try {
        await axios.delete(`${Config.API_BASE_URL}/api/offers/${offerId}`);
        toast.success('تم حذف العرض بنجاح');
        // تحديث قائمة العروض بعد الحذف
        fetchOffers();
      } catch (error) {
        console.error("خطأ في حذف العرض:", error);
        toast.error(`خطأ في حذف العرض: ${error.message}`);
      }
    }
  };

  // دالة لفتح نموذج تحديث العرض
  const handleUpdateOffer = (offerId) => {
    const offer = offers.find(o => o._id === offerId);
    if (offer) {
      setSelectedOffer(offer);
      setUpdatedOffer({
        name: offer.name,
        oldPrice: offer.oldPrice,
        newPrice: offer.newPrice,
        description: offer.description || '',
        sizes: [...offer.sizes],
        colors: [...offer.colors]
      });
      setImagePreview(`${Config.API_BASE_URL}${offer.image}`);
      setIsUpdateModalOpen(true);
    }
  };

  // دالة لإغلاق نموذج التحديث
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedOffer(null);
    setImageFile(null);
    setImagePreview('');
  };

  // دالة لتحديث قيم العرض
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOffer({ ...updatedOffer, [name]: value });
  };

  // دالة لتحديث المصفوفات (الألوان والمقاسات)
  const handleArrayChange = (type, value, isChecked) => {
    if (isChecked) {
      setUpdatedOffer({
        ...updatedOffer,
        [type]: [...updatedOffer[type], value]
      });
    } else {
      setUpdatedOffer({
        ...updatedOffer,
        [type]: updatedOffer[type].filter(item => item !== value)
      });
    }
  };

  // دالة لمعالجة تحميل الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لإرسال تحديث العرض
  const submitOfferUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('name', updatedOffer.name);
      formData.append('oldPrice', updatedOffer.oldPrice);
      formData.append('newPrice', updatedOffer.newPrice);
      formData.append('description', updatedOffer.description);
      formData.append('sizes', updatedOffer.sizes.join(','));
      formData.append('colors', updatedOffer.colors.join(','));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`${Config.API_BASE_URL}/api/offers/${selectedOffer._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('تم تحديث العرض بنجاح');
      closeUpdateModal();
      fetchOffers(); // تحديث قائمة العروض
    } catch (error) {
      console.error("خطأ في تحديث العرض:", error);
      toast.error(`خطأ في تحديث العرض: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // حساب نسبة الخصم
  const calculateDiscount = (oldPrice, newPrice) => {
    if (!oldPrice || !newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  return (
    <div className="rtl container mx-auto p-6 bg-gray-50 text-black rounded-lg shadow-sm">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-r-4 border-black pr-3">إدارة العروض</h2>
      
      {/* إضافة مكون ToastContainer */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      {/* قسم عرض العروض */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">قائمة العروض الحالية</h3>
        
        {/* عرض العروض */}
        {loadingOffers ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">جاري تحميل العروض...</p>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div key={offer._id} className="border rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={`${Config.API_BASE_URL}${offer.image}`} 
                    alt={offer.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                    خصم {calculateDiscount(offer.oldPrice, offer.newPrice)}%
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{offer.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <p className="font-bold text-xl text-black">{offer.newPrice} <span className="text-sm">جنيه</span></p>
                      <p className="text-gray-500 line-through mr-2 text-sm">{offer.oldPrice} <span className="text-xs">جنيه</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">المقاسات المتاحة:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {offer.sizes && offer.sizes.map(size => (
                        <span key={size} className="bg-gray-100 px-3 py-1 text-xs rounded-full text-gray-700">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">الألوان المتاحة:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {offer.colors && offer.colors.map(color => (
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
                      onClick={() => handleUpdateOffer(offer._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      تعديل
                    </button>
                    <button 
                      onClick={() => handleDeleteOffer(offer._id)}
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
            <p className="text-gray-600 text-lg">لا توجد عروض حالية</p>
          </div>
        )}
      </div>
      
      {/* نموذج تحديث العرض */}
      {isUpdateModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">تحديث العرض: {selectedOffer.name}</h3>
              <button 
                onClick={closeUpdateModal}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitOfferUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">اسم العرض</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedOffer.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">السعر الأصلي (جنيه)</label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={updatedOffer.oldPrice}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">سعر العرض (جنيه)</label>
                  <input
                    type="number"
                    name="newPrice"
                    value={updatedOffer.newPrice}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">وصف العرض</label>
                  <input
                    type="text"
                    name="description"
                    value={updatedOffer.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="border-t border-b py-6">
                <label className="block mb-3 font-medium text-gray-700">المقاسات المتاحة</label>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'].map(size => (
                    <label key={size} className="flex items-center border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={updatedOffer.sizes.includes(size)}
                        onChange={(e) => handleArrayChange('sizes', size, e.target.checked)}
                        className="ml-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-6">
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
                        checked={updatedOffer.colors.includes(color.value)}
                        onChange={(e) => handleArrayChange('colors', color.value, e.target.checked)}
                        className="ml-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      {color.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-3 font-medium text-gray-700">صورة العرض</label>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="offerImage"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <label htmlFor="offerImage" className="cursor-pointer block">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600">اضغط لاختيار صورة جديدة</p>
                        <p className="text-gray-400 text-sm mt-1">أو اترك الصورة الحالية كما هي</p>
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="mb-2 font-medium text-gray-700">معاينة الصورة:</p>
                    {imagePreview ? (
                      <div className="border rounded-lg overflow-hidden h-48">
                        <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 text-center h-48 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-400">لا توجد صورة للمعاينة</p>
                      </div>
                    )}
                  </div>
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

export default UpdateOffer;
