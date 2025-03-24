import React, { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Config from '@/config/Config';

const AddOffer = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [offer, setOffer] = useState({
    name: '',
    oldPrice: '',
    newPrice: '',
    sizes: [],
    colors: [],
    description: '',
    image: null
  });
  const [token, setToken] = useState('');

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

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    setToken(storedToken || '');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSizeToggle = (size) => {
    setOffer(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
    
    if (errors.sizes) {
      setErrors(prev => ({ ...prev, sizes: null }));
    }
  };

  const handleColorToggle = (colorId) => {
    setOffer(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(c => c !== colorId)
        : [...prev.colors, colorId]
    }));
    
    if (errors.colors) {
      setErrors(prev => ({ ...prev, colors: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setOffer(prev => ({ ...prev, image: file }));
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: null }));
    }
    
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
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!offer.name.trim()) {
      newErrors.name = 'يرجى إدخال اسم العرض';
      isValid = false;
    }
    
    if (!offer.oldPrice || isNaN(offer.oldPrice) || Number(offer.oldPrice) <= 0) {
      newErrors.oldPrice = 'يرجى إدخال السعر القديم بشكل صحيح';
      isValid = false;
    }
    
    if (!offer.newPrice || isNaN(offer.newPrice) || Number(offer.newPrice) <= 0) {
      newErrors.newPrice = 'يرجى إدخال السعر الجديد بشكل صحيح';
      isValid = false;
    } else if (Number(offer.newPrice) >= Number(offer.oldPrice)) {
      newErrors.newPrice = 'يجب أن يكون السعر الجديد أقل من السعر القديم';
      isValid = false;
    }
    
    if (offer.sizes.length === 0) {
      newErrors.sizes = 'يرجى اختيار مقاس واحد على الأقل';
      isValid = false;
    }
    
    if (offer.colors.length === 0) {
      newErrors.colors = 'يرجى اختيار لون واحد على الأقل';
      isValid = false;
    }
    
    if (!offer.image) {
      newErrors.image = 'يرجى إضافة صورة للعرض';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const calculateDiscountPercentage = () => {
    if (!offer.oldPrice || !offer.newPrice || isNaN(offer.oldPrice) || isNaN(offer.newPrice)) {
      return null;
    }
    
    const oldPrice = Number(offer.oldPrice);
    const newPrice = Number(offer.newPrice);
    
    if (oldPrice <= 0 || newPrice <= 0 || newPrice >= oldPrice) {
      return null;
    }
    
    const discount = ((oldPrice - newPrice) / oldPrice) * 100;
    return Math.round(discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج قبل الإرسال');
      return;
    }

    setLoading(true);
    
    try {
      let imageToUpload = offer.image;
      if (offer.image && offer.image.size > 2 * 1024 * 1024) {
        toast.info('جاري معالجة الصورة...');
        imageToUpload = await compressImage(offer.image);
      }
      
      const formData = new FormData();
      formData.append('name', offer.name);
      formData.append('oldPrice', offer.oldPrice);
      formData.append('newPrice', offer.newPrice);
      formData.append('sizes', offer.sizes.join(','));
      formData.append('colors', offer.colors.join(','));
      formData.append('description', offer.description || '');
      formData.append('image', imageToUpload);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      };

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      const API_URL = `${Config.API_BASE_URL}/api/offers`; 
      console.log('Submitting to:', API_URL);
      console.log('Form data:', offer);
      
      const response = await axios.post(API_URL, formData, config);

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
      setErrors({});
      
      toast.success(`تم إضافة العرض "${response.data?.offer?.name || offer.name}" بنجاح!`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('خطأ في إضافة العرض:', error);
      
      let errorMessage = 'حدث خطأ أثناء إضافة العرض';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال. يرجى التحقق من اتصالك بالإنترنت وحجم الصورة.';
      } else if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'لم يتم استلام استجابة من الخادم. تحقق من اتصالك بالإنترنت.';
      }
      
      toast.error(`حدث خطأ أثناء إضافة العرض: ${errorMessage}`, {
        position: "top-center",
        autoClose: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين النموذج؟')) {
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
      setErrors({});
      toast.info('تم إعادة تعيين النموذج');
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > 1200) {
            const ratio = width / height;
            width = 1200;
            height = width / ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="rtl bg-gray-50 min-h-screen py-8">
      <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">إضافة عرض جديد</h2>
            <p className="text-gray-500 mt-1">أدخل تفاصيل العرض لإضافته إلى المتجر</p>
          </div>
          
          <form className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">اسم العرض</label>
                <input
                  type="text"
                  name="name"
                  value={offer.name}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="مثال: سويت شيرت و بنطلون"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black ${
                    errors.oldPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="مثال: 800"
                />
                {errors.oldPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.oldPrice}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">السعر الجديد (بالجنيه)</label>
                <input
                  type="number"
                  name="newPrice"
                  value={offer.newPrice}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black ${
                    errors.newPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="مثال: 450"
                />
                {errors.newPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPrice}</p>
                )}
              </div>
            </div>
            
            {calculateDiscountPercentage() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                <div className="bg-green-100 text-green-800 font-bold rounded-full h-10 w-10 flex items-center justify-center mr-3">
                  {calculateDiscountPercentage()}%
                </div>
                <div>
                  <p className="text-green-800 font-medium">نسبة الخصم: {calculateDiscountPercentage()}%</p>
                  <p className="text-green-600 text-sm">توفير {Number(offer.oldPrice) - Number(offer.newPrice)} جنيه</p>
                </div>
              </div>
            )}
            
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
              {errors.sizes && (
                <p className="mt-2 text-sm text-red-600">{errors.sizes}</p>
              )}
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
              {errors.colors && (
                <p className="mt-2 text-sm text-red-600">{errors.colors}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">صورة العرض</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  errors.image ? 'border-red-500 bg-red-50' :
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
                          if (errors.image) {
                            setErrors(prev => ({ ...prev, image: null }));
                          }
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
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t flex gap-4">
              <button
                type="button"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all font-medium shadow-sm"
                onClick={handleSubmit}
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
              
              <button
                type="button"
                disabled={loading}
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOffer;
