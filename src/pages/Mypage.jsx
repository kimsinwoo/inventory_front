import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  LogOut,
  Save,
  X,
} from "lucide-react";
import axios from "axios";

const Mypage = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  const [userData, setUserData] = useState({
    userId: "",
    name: "",
    phone: "",
    email: "",
    joinDate: "",
    position: "",
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newPosition, setNewPosition] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        console.log(res);
        const user = res.data?.user ?? res.data;
        if (!user) throw new Error("유저 정보를 불러올 수 없습니다.");
        setUserData({
          userId: user.id ?? "",
          name: user.profile?.full_name ?? "",
          phone: user.profile?.phone_number ?? "",
          email: user.profile?.email ?? "",
          joinDate: user.profile?.hire_date ?? "",
          position: user.profile?.position ?? "",
        });
        setNewPosition(user.profile?.position ?? "");
      } catch (err) {
        if (
          err.response?.status === 401 ||
          (typeof err.response?.data === "string" &&
            err.response.data.includes("<!DOCTYPE html"))
        ) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
        } else {
          alert("유저 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) return alert("모든 필드를 입력해주세요.");
    if (newPassword !== confirmPassword) return alert("새 비밀번호가 일치하지 않습니다.");
    if (newPassword.length < 4) return alert("비밀번호는 최소 4자 이상이어야 합니다.");
    try {
      const res = await api.post("/auth/password", {
        currentPassword,
        newPassword,
      });
      if (res.data.ok) {
        alert("비밀번호가 변경되었습니다.");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsEditingPassword(false);
      } else {
        alert(res.data.message ?? "비밀번호 변경 실패");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        alert("비밀번호 변경 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  const handlePositionSubmit = async () => {
    if (newPosition === "대표") return alert("대표 직급으로 변경할 수 없습니다.");
    if (userData.position === newPosition) {
      setIsEditingPosition(false);
      return;
    }
    try {
      const res = await api.post("/auth/position", { position: newPosition });
      if (res.data.ok) {
        setUserData((prev) => ({ ...prev, position: newPosition }));
        alert("직급이 변경되었습니다.");
        setIsEditingPosition(false);
      } else {
        alert(res.data.message ?? "직급 변경 실패");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        alert("직급 변경 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePositionCancel = () => {
    setNewPosition(userData.position);
    setIsEditingPosition(false);
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
      await api.post("/auth/logout");
    } catch {}
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f9f6f2" }}>
        <div className="text-lg text-[#674529]">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f6f2" }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center space-x-2">
            <User className="h-6 w-6 text-[#674529]" />
            <h1 className="text-2xl font-bold text-[#674529]">마이페이지</h1>
          </div>
          <p className="text-sm text-gray-600">내 정보 조회 및 수정</p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#674529]">기본 정보</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                <span>아이디</span>
              </label>
              <input type="text" value={userData.userId} disabled className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                <span>이름</span>
              </label>
              <input type="text" value={userData.name} disabled className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4" />
                <span>연락처</span>
              </label>
              <input type="text" value={userData.phone} disabled className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                <span>이메일</span>
              </label>
              <input type="email" value={userData.email} disabled className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>입사일</span>
              </label>
              <input type="text" value={userData.joinDate} disabled className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Briefcase className="h-4 w-4" />
                <span>직급</span>
              </label>
              <div className="flex items-center space-x-2">
                <input type="text" value={userData.position} disabled className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm text-gray-900" />
                {!isEditingPosition && (
                  <button onClick={() => setIsEditingPosition(true)} className="rounded bg-[#674529] px-3 py-2 text-sm text-white transition-colors hover:bg-[#543620]">
                    변경
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditingPosition && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#674529]">직급 변경</h2>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">새 직급 선택</label>
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              >
                <option value="알바">알바</option>
                <option value="직원">직원</option>
                <option value="경영지원팀">경영지원팀</option>
                <option value="생산팀">생산팀</option>
                <option value="팀장">팀장</option>
                <option value="이사">이사</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handlePositionCancel}
                className="flex items-center space-x-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                <span>취소</span>
              </button>
              <button
                onClick={handlePositionSubmit}
                className="flex items-center space-x-2 rounded bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#543620]"
              >
                <Save className="h-4 w-4" />
                <span>저장</span>
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#674529]">비밀번호 변경</h2>
            {!isEditingPassword && (
              <button onClick={() => setIsEditingPassword(true)} className="rounded bg-[#674529] px-4 py-2 text-sm text-white transition-colors hover:bg-[#543620]">
                비밀번호 변경
              </button>
            )}
          </div>

          {isEditingPassword && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    <span>기존 비밀번호</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="기존 비밀번호를 입력하세요"
                    className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    <span>새 비밀번호</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    <span>비밀번호 확인</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handlePasswordCancel}
                  className="flex items-center space-x-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  <span>취소</span>
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex items-center space-x-2 rounded bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#543620]"
                >
                  <Save className="h-4 w-4" />
                  <span>저장</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mypage;
