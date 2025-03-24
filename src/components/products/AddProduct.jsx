import React, { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Config from '@/config/Config'; 

const AddProduct = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    price: '',
    category: '',
    sizes: [],
    colors: [],
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
  const CATEGORIES = [
    { id: 'pants', label: 'بناطيل' },
    { id: 'shirts', label: 'تيشرت' },
    { id: 'hoodies', label: 'هوديز' },
    { id: 'boxers', label: 'بوكسر' },
    { id: 'undershirt', label: 'فانلة داخلية' },
    { id: 'underwear', label: 'طقم داخلي' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (colorId) => {
    setProduct(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(c => c !== colorId)
        : [...prev.colors, colorId]
    }));
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.7);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      // ضغط الصورة قبل الرفع
      const compressedFile = await compressImage(file);
      console.log(`حجم الصورة الأصلي: ${file.size / 1024} كيلوبايت، الحجم بعد الضغط: ${compressedFile.size / 1024} كيلوبايت`);
      
      setProduct(prev => ({ ...prev, image: compressedFile }));
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("خطأ في معالجة الصورة:", error);
      toast.error("حدث خطأ أثناء معالجة الصورة");
    }
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
      setProduct(prev => ({ ...prev, image: file }));
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!product.name.trim()) return 'يرجى إدخال اسم المنتج';
    if (!product.price || isNaN(product.price) || Number(product.price) <= 0) 
      return 'يرجى إدخال سعر صحيح';
    if (product.sizes.length === 0) return 'يرجى اختيار مقاس واحد على الأقل';
    if (product.colors.length === 0) return 'يرجى اختيار لون واحد على الأقل';
    if (!product.image) return 'يرجى إضافة صورة للمنتج';
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
      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('category', product.category || 'pants');
      
      // إضافة المقاسات والألوان كسلاسل مفصولة بفواصل
      formData.append('sizes', product.sizes.join(','));
      formData.append('colors', product.colors.join(','));
      
      // إضافة الصورة
      formData.append('image', product.image);

      // إضافة حقل stock بقيمة افتراضية
      formData.append('stock', '10');
      
      // طباعة البيانات للتحقق منها قبل الإرسال
      console.log('بيانات المنتج المرسلة:', {
        name: product.name,
        price: product.price,
        category: product.category || 'pants',
        sizes: product.sizes.join(','),
        colors: product.colors.join(','),
        hasImage: !!product.image,
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      });

      // التحقق من وجود التوكن
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('لم يتم العثور على توكن التوثيق. يرجى تسجيل الدخول مرة أخرى.');
      }

      // إرسال البيانات إلى الخادم
      const response = await axios.post(`${Config.API_BASE_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        // إضافة خيارات إضافية لمعالجة الملفات بشكل أفضل
        timeout: 30000, // زيادة مهلة الانتظار إلى 30 ثانية
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`تقدم الرفع: ${percentCompleted}%`);
        }
      });
      // إذا نجحت العملية
      console.log('تم إضافة المنتج بنجاح:', response.data);
      window.alert("تم اضافة المنتج بنجاح")
      toast.success(`تم إضافة المنتج بنجاح! المعرف: ${response.data.id || 'غير متوفر'}`);
      // إعادة تعيين النموذج
      setProduct({
        name: '',
        price: '',
        category: '',
        sizes: [],
        colors: [],
        image: null
      });
      setPreview(null);
      
    } catch (error) {
      console.error("Error adding product:", error);
      
      // تحسين عرض معلومات الخطأ
      if (error.response) {
        // الخادم استجاب برمز حالة خارج نطاق 2xx
        console.log("Status code:", error.response.status);
        console.log("Response headers:", error.response.headers);
        console.log("Response data:", error.response.data);
        toast.error(`فشل في إضافة المنتج: ${error.response.data?.message || `خطأ في الخادم (${error.response.status})`}`);
      } else if (error.request) {
        // تم إرسال الطلب لكن لم يتم استلام استجابة
        console.log("Request sent but no response received:", error.request);
        toast.error('فشل في الاتصال بالخادم. تحقق من اتصالك بالإنترنت.');
      } else {
        // حدث خطأ أثناء إعداد الطلب
        console.log("Error message:", error.message);
        toast.error(`حدث خطأ: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtl bg-gray-50 min-h-screen py-8">
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
      />
      
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">إضافة منتج جديد</h2>
            <p className="text-gray-500 mt-1">أدخل تفاصيل المنتج لإضافته إلى المتجر</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">اسم المنتج</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all  text-black"
                  placeholder="مثال: شروال "
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">السعر (بالجنيه)</label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="مثال: 399"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">الفئة</label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
              >
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
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
                      product.sizes.includes(size) 
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
                      product.colors.includes(color.id) 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full mr-2 border border-gray-300" 
                      style={{ backgroundColor: color.hex }}
                    ></span>
                    <span className={`${product.colors.includes(color.id) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">صورة المنتج</label>
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
                  id="product-image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                
                {preview ? (
                  <div className="space-y-4">
                    <img 
                      src={preview} 
                      alt="معاينة المنتج" 
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
                          setProduct(prev => ({ ...prev, image: null }));
                          setPreview(null);
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="product-image" className="cursor-pointer">
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
                ) : 'إضافة المنتج'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
