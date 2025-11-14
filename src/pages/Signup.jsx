import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, User, Lock, Phone, Mail, Calendar, IdCard, Briefcase, Building2 } from 'lucide-react';
<<<<<<< HEAD
import { signup } from '../store/modules/auth/actions';
=======
import { authAPI } from '../api';
>>>>>>> origin/label-print

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { loading, error, signupSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    email: '',
    position: '',
    department: '',
    hireDate: ''
  });

  // 회원가입 성공 시 로그인 페이지로 이동
  useEffect(() => {
    if (signupSuccess) {
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    }
  }, [signupSuccess, navigate]);

  // 에러 발생 시 알림
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

<<<<<<< HEAD
    // Redux Saga를 통한 회원가입 처리
    // 화면에 표시된 모든 필드를 백엔드로 전송
    dispatch(signup.request({
      userId: formData.userId,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      hireDate: formData.hireDate
    }));
=======
    try {
      const response = await authAPI.join({
        username: formData.userId,
        password: formData.password,
        full_name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        position: formData.position,
        department: formData.department,
        hire_date: formData.hireDate ? new Date(formData.hireDate).toISOString() : undefined,
      });

      if (response.data?.ok || response.data?.user) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else {
        throw new Error(response.data?.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '회원가입에 실패했습니다.';
      alert(errorMessage);
    }
>>>>>>> origin/label-print
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f9f6f2' }}>
      <div className="w-full max-w-2xl">
        {/* 로고/헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-[#F9B679] rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">애</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#674529]">애니콩 펫베이커리</h1>
          <p className="text-gray-600 mt-2">제조관리 시스템</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-2 mb-6">
            <UserPlus className="w-6 h-6 text-[#674529]" />
            <h2 className="text-2xl font-bold text-[#674529]">회원가입</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 아이디 입력 */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-[#674529] mb-2">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#674529] mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                    placeholder="비밀번호"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#674529] mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                    placeholder="비밀번호 확인"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 이름 입력 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#674529] mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 연락처 및 이메일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#674529] mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#674529] mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 직급 및 소속 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-[#674529] mb-2">
                  직급 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all appearance-none bg-white"
                    style={{ color: formData.position ? '#111827' : '#9ca3af' }}
                    required
                  >
                    <option value="" disabled hidden style={{ color: '#9ca3af' }}>직급을 선택하세요</option>
                    <option value="이사" style={{ color: '#111827' }}>이사</option>
                    <option value="팀장" style={{ color: '#111827' }}>팀장</option>
                    <option value="직원" style={{ color: '#111827' }}>직원</option>
                    <option value="알바" style={{ color: '#111827' }}>알바</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-[#674529] mb-2">
                  소속 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all appearance-none bg-white"
                    style={{ color: formData.department ? '#111827' : '#9ca3af' }}
                    required
                  >
                    <option value="" disabled hidden style={{ color: '#9ca3af' }}>소속을 선택하세요</option>
                    <option value="경영지원팀" style={{ color: '#111827' }}>경영지원팀</option>
                    <option value="생산팀" style={{ color: '#111827' }}>생산팀</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 입사일 */}
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-[#674529] mb-2">
                입사일 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724323] focus:border-transparent outline-none transition-all"
                  style={{ color: formData.hireDate ? '#111827' : '#9ca3af' }}
                  required
                />
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full bg-[#724323] text-white py-3 rounded-lg font-semibold hover:bg-[#5a3419] transition-colors duration-200 mt-6"
            >
              회원가입
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?
              <Link
                to="/login"
                className="text-[#724323] font-semibold hover:text-[#5a3419] transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;