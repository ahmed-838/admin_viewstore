import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Config from '@/config/Config';

const AddOffer = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState({
    name: '',
    oldPrice: '',
    newPrice: '',
    sizes: [],
    colors: [],
    description: '',
    image: null
  });

  const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  const AVAILABLE_COLORS = [
    { id: 'black', label: 'أسود', hex: '#000000' },
    { id: 'white', label: 'أبيض', hex: '#FFFFFF' },
    { id: 'red', label: 'أحمر', hex: '#FF0000' },
    { id: 'blue', label: 'أزرق', hex: '#0000FF' },
    { id: 'green', label: 'أخضر', hex: '#008000' },
    { id: 'yellow', label: 'أصفر', hex: '#FFFF00' },
    { id: 'gray', label: 'رمادي', hex: '#808080' },
    { id: 'brown', label: 'بني', hex: '#A52A2A' },
    { id: 'navy', label: 'كحلي', hex: '#000080' },
    { id: 'beige', label: 'بيج', hex: '#F5F5DC' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setOffer(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (colorId) => {
    setOffer(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(c => c !== colorId)
        : [...prev.colors, colorId]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setOffer(prev => ({ ...prev, image: file }));
    
    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      setOffer(prev => ({ ...prev, image: file }));
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!offer.name.trim()) return 'يرجى إدخال اسم العرض';
    if (!offer.oldPrice || isNaN(offer.oldPrice) || Number(offer.oldPrice) <= 0) 
      return 'يرجى إدخال السعر القديم بشكل صحيح';
    if (!offer.newPrice || isNaN(offer.newPrice) || Number(offer.newPrice) <= 0) 
      return 'يرجى إدخال السعر الجديد بشكل صحيح';
    if (Number(offer.newPrice) >= Number(offer.oldPrice))
      return 'يجب أن يكون السعر الجديد أقل من السعر القديم';
    if (offer.sizes.length === 0) return 'يرجى اختيار مقاس واحد على الأقل';
    if (offer.colors.length === 0) return 'يرجى اختيار لون واحد على الأقل';
    if (!offer.image) return 'يرجى إضافة صورة للعرض';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    
    try {
      // إنشاء كائن FormData لإرسال البيانات والصورة
      const formData = new FormData();
      formData.append('name', offer.name);
      formData.append('oldPrice', offer.oldPrice);
      formData.append('newPrice', offer.newPrice);
      formData.append('description', offer.description || offer.name);
      formData.append('category', 'offers'); // إضافة فئة العروض
      
      // إضافة المقاسات والألوان كسلاسل مفصولة بفواصل
      formData.append('sizes', offer.sizes.join(','));
      formData.append('colors', offer.colors.join(','));
      
      // إضافة الصورة
      formData.append('image', offer.image);

      // تعديل عنوان الخادم - استخدم المسار الصحيح للخادم الخاص بك
      const API_URL = `${Config.API_BASE_URL}/api/offers`; 
      
      // إرسال البيانات إلى الخادم
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // إعادة تعيين النموذج
      setOffer({
        name: '',
        oldPrice: '',
        newPrice: '',
        sizes: [],
        colors: [],
        description: '',
        image: null
      });
      setPreview(null);
      
      toast.success('تم إضافة العرض بنجاح!');
    } catch (error) {
      console.error('Error adding offer:', error);
      
      // تحسين رسالة الخطأ
      let errorMessage = 'حدث خطأ في الاتصال بالخادم';
      
      if (error.response) {
        // الخادم استجاب برمز حالة خارج نطاق 2xx
        errorMessage = error.response.data?.message || 'حدث خطأ في معالجة الطلب';
      } else if (error.request) {
        // لم يتم استلام استجابة من الخادم
        errorMessage = 'لا يمكن الاتصال بالخادم، تأكد من تشغيل الخادم';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtl bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">إضافة عرض جديد</h2>
            <p className="text-gray-500 mt-1">أدخل تفاصيل العرض لإضافته إلى المتجر</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">اسم العرض</label>
                <input
                  type="text"
                  name="name"
                  value={offer.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="مثال: سويت شيرت و بنطلون"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">وصف العرض (اختياري)</label>
                <input
                  type="text"
                  name="description"
                  value={offer.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="وصف مختصر للعرض"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">السعر القديم (بالجنيه)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={offer.oldPrice}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="مثال: 800"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">السعر الجديد (بالجنيه)</label>
                <input
                  type="number"
                  name="newPrice"
                  value={offer.newPrice}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="مثال: 450"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">المقاسات المتاحة</label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 border rounded-md transition-all ${
                      offer.sizes.includes(size) 
                        ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">الألوان المتاحة</label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorToggle(color.id)}
                    className={`flex items-center px-4 py-2 border rounded-md transition-all ${
                      offer.colors.includes(color.id) 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full mr-2 border border-gray-300" 
                      style={{ backgroundColor: color.hex }}
                    ></span>
                    <span className={`${offer.colors.includes(color.id) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">صورة العرض</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  preview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="offer-image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                
                {preview ? (
                  <div className="space-y-4">
                    <img 
                      src={preview} 
                      alt="معاينة العرض" 
                      className="max-h-64 mx-auto rounded-lg shadow-sm" 
                    />
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        تغيير الصورة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOffer(prev => ({ ...prev, image: null }));
                          setPreview(null);
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="offer-image" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 mb-1">اضغط لاختيار صورة أو اسحب الصورة هنا</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF حتى 5MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all font-medium shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإضافة...
                  </span>
                ) : 'إضافة العرض'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOffer;
