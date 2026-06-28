import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Shield, Search, UserPlus, Trash2, Lock, Unlock, RefreshCw } from "lucide-react";
import RippleLoader from "../lightswind/RippleLoader";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import "../../styles/AdminTabs.css";
import { DOTNET_API_URL } from "../../config";

export default function AdminDashboardTab() {
  const [subTab, setSubTab] = useState("personal"); // "personal" | "others"
  const [loading, setLoading] = useState(false);

  // --- Personal Account State ---
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Administrator",
    email: "admin@integral.ai",
    phone: "0987654321",
    role: "Quản trị viên tối cao",
    lastLogin: "22:58:48 - 21/06/2026",
    avatar: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "success", // "success" | "error"
    title: "",
    message: ""
  });

  const showToast = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  // OTP states for password changing
  const [otpStep, setOtpStep] = useState(1); // 1 = OTP verification, 2 = enter new password
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Helper mappings
  const mapRole = (roleCode) => {
    const code = (roleCode || "").toLowerCase();
    if (code === "admin") return "Quản trị viên";
    if (code === "user") return "Người dùng";
    if (code === "moderator") return "Kiểm duyệt viên";
    return roleCode;
  };

  const mapRoleToCode = (roleName) => {
    if (roleName === "Quản trị viên") return "admin";
    if (roleName === "Người dùng") return "user";
    if (roleName === "Kiểm duyệt viên") return "moderator";
    return roleName;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa đăng nhập";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const pad = (n) => String(n).padStart(2, '0');
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Fetch personal profile from API
  const fetchPersonalInfo = async (uid) => {
    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account/${uid}`);
      if (response.ok) {
        const data = await response.json();
        const storedAvatar = localStorage.getItem("admin_avatar");
        setPersonalInfo({
          fullName: data.displayName || data.DisplayName || "",
          email: data.email || data.Email || "",
          phone: data.phone || data.Phone || "",
          role: mapRole(data.role || data.Role),
          lastLogin: formatDate(data.lastLoginAt || data.LastLoginAt),
          avatar: data.photoUrl || data.PhotoUrl || storedAvatar || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch personal info from API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load user from localStorage if exists
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAvatar = localStorage.getItem("admin_avatar");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const uid = parsed.uid || parsed.Uid;
        if (uid) {
          fetchPersonalInfo(uid);
        } else {
          setPersonalInfo(prev => ({
            ...prev,
            fullName: parsed.displayName || parsed.fullName || "Administrator",
            email: parsed.email || "admin@integral.ai",
            role: parsed.role || parsed.Role || "Quản trị viên tối cao",
            avatar: parsed.avatar || storedAvatar || ""
          }));
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    } else if (storedAvatar) {
      setPersonalInfo(prev => ({
        ...prev,
        avatar: storedAvatar
      }));
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "Thay đổi thất bại", "Kích thước ảnh không được vượt quá 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;

        // 1. Update component state
        setPersonalInfo(prev => ({
          ...prev,
          avatar: base64String
        }));

        // 2. Update localStorage admin_avatar
        localStorage.setItem("admin_avatar", base64String);

        // 3. Update 'user' object in localStorage if exists
        const storedUser = localStorage.getItem("user");
        let uid = null;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.avatar = base64String;
            parsed.photoUrl = base64String;
            localStorage.setItem("user", JSON.stringify(parsed));
            uid = parsed.uid || parsed.Uid;
          } catch (err) {
            console.error("Failed to update avatar in stored user object:", err);
          }
        }

        // 4. Send immediately to backend if uid exists
        if (uid) {
          setLoading(true);
          try {
            const payload = {
              displayName: personalInfo.fullName,
              photoUrl: base64String,
              phone: personalInfo.phone
            };
            const response = await fetch(`${DOTNET_API_URL}/Account/${uid}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              console.error("Failed to sync avatar to backend");
            }
          } catch (err) {
            console.error("Error syncing avatar to backend:", err);
          } finally {
            setLoading(false);
          }
        }

        // 5. Notify other components (like Header)
        window.dispatchEvent(new Event("admin_avatar_updated"));

        showToast("success", "Thành công", "Thay đổi ảnh đại diện thành công!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(storedUser);
      const uid = parsed.uid || parsed.Uid;
      if (!uid) {
        showToast("error", "Cập nhật thất bại", "Không tìm thấy thông tin tài khoản!");
        setLoading(false);
        return;
      }

      const payload = {
        displayName: personalInfo.fullName,
        photoUrl: personalInfo.avatar,
        phone: personalInfo.phone
      };

      const response = await fetch(`${DOTNET_API_URL}/Account/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Cập nhật thất bại");
      }

      const data = await response.json();

      // Update local storage 'user' object so the state stays synced
      parsed.displayName = data.displayName || data.DisplayName;
      parsed.photoUrl = data.photoUrl || data.PhotoUrl;
      parsed.phone = data.phone || data.Phone;
      parsed.avatar = data.photoUrl || data.PhotoUrl; // compatibility
      localStorage.setItem("user", JSON.stringify(parsed));

      // Update local state
      setPersonalInfo(prev => ({
        ...prev,
        fullName: data.displayName || data.DisplayName || prev.fullName,
        phone: data.phone || data.Phone || prev.phone,
        avatar: data.photoUrl || data.PhotoUrl || prev.avatar
      }));

      // Notify other components (like Header)
      window.dispatchEvent(new Event("admin_avatar_updated"));

      showToast("success", "Thành công", "Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      console.error(err);
      showToast("error", "Cập nhật thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setOtpStep(1);
    setOtpCode("");
    setOtpSent(false);
    setOtpCountdown(0);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordForm(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordForm(false);
    setOtpStep(1);
    setOtpCode("");
    setOtpSent(false);
    setOtpCountdown(0);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSendOtp = async () => {
    if (!personalInfo.email) {
      showToast("error", "Gửi OTP thất bại", "Không tìm thấy địa chỉ email!");
      return;
    }
    setOtpLoading(true);
    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: personalInfo.email })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Gửi OTP thất bại");
      }

      setOtpSent(true);
      setOtpCountdown(60);
      showToast("success", "Thành công", "Mã OTP đã được gửi tới email của bạn!");
    } catch (err) {
      console.error(err);
      showToast("error", "Gửi OTP thất bại", err.message);
    } finally {
      setOtpLoading(false);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showToast("error", "Xác thực thất bại", "Vui lòng nhập mã OTP gồm 6 chữ số.");
      return;
    }
    setOtpLoading(true);
    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: personalInfo.email, code: otpCode })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Xác thực OTP thất bại");
      }

      showToast("success", "Thành công", "Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.");
      setOtpStep(2);
    } catch (err) {
      console.error(err);
      showToast("error", "Xác thực thất bại", err.message);
    } finally {
      setOtpLoading(false);
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast("error", "Đổi mật khẩu thất bại", "Vui lòng điền đầy đủ thông tin mật khẩu!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("error", "Đổi mật khẩu thất bại", "Xác nhận mật khẩu mới không khớp!");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(storedUser);
      const uid = parsed.uid || parsed.Uid;
      if (!uid) {
        showToast("error", "Đổi mật khẩu thất bại", "Không tìm thấy thông tin tài khoản!");
        setLoading(false);
        return;
      }

      const response = await fetch(`${DOTNET_API_URL}/Account/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: uid,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Đổi mật khẩu thất bại");
      }

      showToast("success", "Thành công", "Đổi mật khẩu tài khoản thành công!");
      handleClosePasswordModal();
    } catch (err) {
      console.error(err);
      showToast("error", "Đổi mật khẩu thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Others Accounts State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState([]);

  const [newUserForm, setNewUserForm] = useState({
    email: "",
    fullName: "",
    role: "Người dùng",
    password: ""
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account`);
      if (response.ok) {
        const data = await response.json();

        // Find current user's UID to filter it out
        const storedUser = localStorage.getItem("user");
        let currentUid = "";
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            currentUid = parsed.uid || parsed.Uid || "";
          } catch (e) {
            console.error(e);
          }
        }

        const mapped = data
          .filter(u => (u.uid || u.Uid) !== currentUid)
          .map(u => ({
            id: u.uid || u.Uid,
            email: u.email || u.Email || "",
            fullName: u.displayName || u.DisplayName || "",
            role: mapRole(u.role || u.Role),
            status: u.status || u.Status || "Hoạt động",
            lastLogin: formatDate(u.lastLoginAt || u.LastLoginAt)
          }));

        setUsersList(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch other accounts list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load other users whenever we switch to others tab
  useEffect(() => {
    if (subTab === "others") {
      fetchUsersList();
    }
  }, [subTab]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.fullName || !newUserForm.password) {
      showToast("error", "Tạo tài khoản thất bại", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: newUserForm.email,
        password: newUserForm.password,
        displayName: newUserForm.fullName,
        role: mapRoleToCode(newUserForm.role)
      };

      const response = await fetch(`${DOTNET_API_URL}/Account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Đăng ký thất bại");
      }

      showToast("success", "Thành công", "Tạo tài khoản mới thành công!");
      setNewUserForm({ email: "", fullName: "", role: "Người dùng", password: "" });
      setShowAddForm(false);
      await fetchUsersList();
    } catch (err) {
      console.error(err);
      showToast("error", "Tạo tài khoản thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}"?`)) {
      setLoading(true);
      try {
        const response = await fetch(`${DOTNET_API_URL}/Account/${id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Xóa tài khoản thất bại");
        }

        showToast("success", "Thành công", "Xóa tài khoản thành công!");
        await fetchUsersList();
      } catch (err) {
        console.error(err);
        showToast("error", "Xóa tài khoản thất bại", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const targetUser = usersList.find(u => u.id === id);
    if (!targetUser) return;

    const nextStatus = targetUser.status === "Hoạt động" ? "Bị khóa" : "Hoạt động";

    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Thay đổi trạng thái thất bại");
      }

      showToast("success", "Thành công", "Thay đổi trạng thái tài khoản thành công!");
      await fetchUsersList();
    } catch (err) {
      console.error(err);
      showToast("error", "Thao tác thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (id) => {
    const targetUser = usersList.find(u => u.id === id);
    if (!targetUser) return;

    const currentRoleCode = mapRoleToCode(targetUser.role);
    const nextRoleCode = currentRoleCode === "admin" ? "user" : "admin";

    setLoading(true);
    try {
      const response = await fetch(`${DOTNET_API_URL}/Account/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRoleCode })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.Message || errData.error || errData.Error || "Thay đổi vai trò thất bại");
      }

      showToast("success", "Thành công", "Thay đổi vai trò tài khoản thành công!");
      await fetchUsersList();
    } catch (err) {
      console.error(err);
      showToast("error", "Thao tác thất bại", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q);
  });

  return (
    <div className="admin-tab-container-nasani">
      <h2 className="dashboard-nasani-title">Hệ thống quản lý tài khoản</h2>

      {/* Sub-tabs switchers */}
      <div className="admin-subtabs-nav" style={{ marginBottom: "24px" }}>
        <button
          className={`admin-subtab-btn ${subTab === "personal" ? "active" : ""}`}
          onClick={() => setSubTab("personal")}
        >
          Tài khoản cá nhân
        </button>
        <button
          className={`admin-subtab-btn ${subTab === "others" ? "active" : ""}`}
          onClick={() => setSubTab("others")}
        >
          Quản lý tài khoản khác
        </button>
      </div>

      {subTab === "personal" ? (
        /* ================= PERSONAL ACCOUNT ================= */
        <div className="personal-tab-layout">
          <div className="personal-grid">
            {/* Left Box: Avatar & Status Info */}
            <div className="personal-avatar-card">
              <div className="avatar-wrapper-interactive">
                <div className="avatar-placeholder-circle">
                  {personalInfo.avatar ? (
                    <img
                      src={personalInfo.avatar}
                      alt="Avatar"
                      className="avatar-image-full"
                    />
                  ) : (
                    <User size={64} className="avatar-icon-large" />
                  )}
                </div>
                <label htmlFor="avatar-file-input" className="avatar-upload-overlay" title="Thay đổi ảnh đại diện">
                  <span>Thay đổi</span>
                </label>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <h3 className="profile-name-text">{personalInfo.fullName}</h3>
              <span className="profile-role-badge">{personalInfo.role}</span>

              <div className="profile-metadata-list">
                <div className="metadata-row">
                  <span>Trạng thái:</span>
                  <strong className="status-active-text">Đang hoạt động</strong>
                </div>
                <div className="metadata-row">
                  <span>Đăng nhập cuối:</span>
                  <span className="metadata-val">{personalInfo.lastLogin}</span>
                </div>
              </div>
            </div>

            {/* Right Box: Update Profile & Password Forms */}
            <div className="personal-forms-card">
              <form className="personal-details-form" onSubmit={handleUpdateInfo}>
                <h4 className="card-section-title">Thông tin tài khoản</h4>
                <div className="form-fields-grid">
                  <div className="filter-group">
                    <label className="filter-label">Họ và tên:</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Địa chỉ Email:</label>
                    <input
                      type="email"
                      className="filter-input"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Số điện thoại:</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button type="submit" className="search-btn-green" style={{ width: "auto" }}>
                    Cập nhật thông tin
                  </button>
                  <button
                    type="button"
                    className="search-btn-green btn-purple"
                    style={{ width: "auto" }}
                    onClick={handleOpenPasswordModal}
                  >
                    Thay đổi mật khẩu
                  </button>
                </div>
              </form>

              {showPasswordForm && createPortal(
                <div className="modal-overlay-nasani" onClick={handleClosePasswordModal}>
                  <div className="modal-content-nasani" onClick={(e) => e.stopPropagation()}>
                    {otpStep === 1 ? (
                      <form className="personal-password-form" onSubmit={handleVerifyOtp}>
                        <h4 className="card-section-title" style={{ marginTop: 0 }}>Xác thực email đổi mật khẩu</h4>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                          Để bảo mật, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến email đăng nhập của bạn.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                          <div className="filter-group" style={{ width: "100%" }}>
                            <label className="filter-label">Email tài khoản:</label>
                            <input
                              type="email"
                              className="filter-input"
                              value={personalInfo.email}
                              disabled
                            />
                          </div>

                          {otpSent && (
                            <div className="filter-group" style={{ width: "100%" }}>
                              <label className="filter-label">Nhập mã OTP gồm 6 chữ số:</label>
                              <input
                                type="text"
                                maxLength={6}
                                className="filter-input"
                                placeholder="123456"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                required
                              />
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px" }}>
                                <span style={{ color: "#666" }}>Mã có hiệu lực trong 5 phút</span>
                                <span>
                                  {otpCountdown > 0 ? (
                                    <span style={{ color: "#888" }}>Gửi lại sau {otpCountdown}s</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleSendOtp}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--koa-green, #10b981)",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        padding: 0
                                      }}
                                      disabled={otpLoading}
                                    >
                                      Gửi lại mã OTP
                                    </button>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="search-btn-green btn-gray"
                            style={{ width: "auto" }}
                            onClick={handleClosePasswordModal}
                          >
                            Hủy bỏ
                          </button>
                          {!otpSent ? (
                            <button
                              type="button"
                              className="search-btn-green btn-purple"
                              style={{ width: "auto" }}
                              onClick={handleSendOtp}
                              disabled={otpLoading}
                            >
                              {otpLoading ? "Đang gửi..." : "Gửi mã OTP"}
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="search-btn-green btn-purple"
                              style={{ width: "auto" }}
                              disabled={otpLoading}
                            >
                              {otpLoading ? "Đang xác thực..." : "Xác minh mã OTP"}
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <form className="personal-password-form" onSubmit={handleChangePassword}>
                        <h4 className="card-section-title" style={{ marginTop: 0 }}>Thiết lập mật khẩu mới</h4>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                          Đã xác minh tài khoản thành công. Hãy điền mật khẩu mới của bạn dưới đây.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                          <div className="filter-group" style={{ width: "100%" }}>
                            <label className="filter-label">Mật khẩu mới:</label>
                            <input
                              type="password"
                              className="filter-input"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                            />
                          </div>
                          <div className="filter-group" style={{ width: "100%" }}>
                            <label className="filter-label">Xác nhận mật khẩu mới:</label>
                            <input
                              type="password"
                              className="filter-input"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="search-btn-green btn-gray"
                            style={{ width: "auto" }}
                            onClick={handleClosePasswordModal}
                          >
                            Hủy bỏ
                          </button>
                          <button type="submit" className="search-btn-green btn-purple" style={{ width: "auto" }}>
                            Cập nhật mật khẩu mới
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= OTHERS ACCOUNTS ================= */
        <div className="others-tab-layout">
          {/* Top Actions: Search Bar & Open Add Form */}
          <div className="others-action-bar">
            <div className="search-bar-container" style={{ flex: 1, maxWidth: "360px" }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input-field"
                placeholder="Tìm kiếm tài khoản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="search-btn-green"
              style={{ width: "auto", display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus size={16} />
              <span>Thêm tài khoản mới</span>
            </button>
          </div>

          {/* Add New User Form Modal Overlay */}
          {showAddForm && createPortal(
            <div className="modal-overlay-nasani" onClick={() => {
              setShowAddForm(false);
              setNewUserForm({ email: "", fullName: "", role: "Người dùng", password: "" });
            }}>
              <div className="modal-content-nasani" onClick={(e) => e.stopPropagation()}>
                <form className="add-user-formfilter" onSubmit={handleAddUser} style={{ margin: 0 }}>
                  <h4 className="card-section-title" style={{ marginTop: 0, marginBottom: "20px" }}>Tạo tài khoản mới</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                    <div className="filter-group" style={{ width: "100%" }}>
                      <label className="filter-label">Họ và tên:</label>
                      <input
                        type="text"
                        className="filter-input"
                        placeholder="Nguyễn Văn A"
                        value={newUserForm.fullName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="filter-group" style={{ width: "100%" }}>
                      <label className="filter-label">Địa chỉ Email:</label>
                      <input
                        type="email"
                        className="filter-input"
                        placeholder="example@gmail.com"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="filter-group" style={{ width: "100%" }}>
                      <label className="filter-label">Mật khẩu ban đầu:</label>
                      <input
                        type="password"
                        className="filter-input"
                        placeholder="******"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="filter-group" style={{ width: "100%" }}>
                      <label className="filter-label">Vai trò hiển thị:</label>
                      <select
                        className="filter-input select-input"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        style={{ height: "42px", padding: "0 12px" }}
                      >
                        <option value="Người dùng">Người dùng</option>
                        <option value="Quản trị viên">Quản trị viên</option>
                        <option value="Kiểm duyệt viên">Kiểm duyệt viên</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="search-btn-green btn-gray"
                      style={{ width: "auto" }}
                      onClick={() => {
                        setShowAddForm(false);
                        setNewUserForm({ email: "", fullName: "", role: "Người dùng", password: "" });
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button type="submit" className="search-btn-green btn-purple" style={{ width: "auto" }}>
                      Xác nhận tạo tài khoản
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Users List Table */}
          <div className="metrics-table-wrapper-nasani">
            <table className="table-nasani">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Địa chỉ Email</th>
                  <th>Vai trò</th>
                  <th className="align-center">Truy cập cuối</th>
                  <th className="align-center">Trạng thái</th>
                  <th className="align-center" style={{ width: "240px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-state">
                      Không tìm thấy tài khoản nào khớp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="keyword-td-text">{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role === "Quản trị viên" ? "admin" : "user"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="align-center" style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{user.lastLogin}</td>
                      <td className="align-center">
                        <span className={`status-pill ${user.status === "Hoạt động" ? "active" : "blocked"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="align-center">
                        <div className="action-buttons-cell">
                          {/* Switch Role Button */}
                          <button
                            className="action-cell-btn role-toggle"
                            onClick={() => handleToggleRole(user.id)}
                            title="Thay đổi vai trò (Người dùng / Quản trị viên)"
                          >
                            <Shield size={13} />
                            <span>Đổi quyền</span>
                          </button>

                          {/* Toggle status (Lock / Unlock) */}
                          <button
                            className={`action-cell-btn ${user.status === "Hoạt động" ? "lock" : "unlock"}`}
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.status === "Hoạt động" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {user.status === "Hoạt động" ? <Lock size={13} /> : <Unlock size={13} />}
                            <span>{user.status === "Hoạt động" ? "Khóa" : "Mở khóa"}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            className="action-cell-btn delete"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            title="Xóa tài khoản vĩnh viễn"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notification.show && createPortal(
        <div className="modal-overlay-nasani" style={{ zIndex: 10000 }} onClick={() => setNotification({ ...notification, show: false })}>
          <div className="modal-content-nasani" style={{ maxWidth: "420px", padding: "16px", borderRadius: 0, border: "none" }} onClick={(e) => e.stopPropagation()}>
            <Alert
              variant={notification.type === "success" ? "success" : "destructive"}
              withIcon={true}
              className="border-none"
              style={{ borderRadius: 0, padding: 0 }}
            >
              <AlertTitle style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px", textAlign: "left" }}>
                {notification.title}
              </AlertTitle>
              <AlertDescription style={{ textAlign: "left", marginBottom: "16px", color: "#4b5563" }}>
                {notification.message}
              </AlertDescription>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="search-btn-green btn-purple"
                  style={{ width: "auto", margin: 0, padding: "8px 24px", height: "38px", fontSize: "13px" }}
                  onClick={() => setNotification({ ...notification, show: false })}
                >
                  Đồng ý
                </button>
              </div>
            </Alert>
          </div>
        </div>,
        document.body
      )}

      {loading && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s"
        }}>
          <RippleLoader size={50} duration="3s" logoColor="dodgerblue" />
        </div>,
        document.body
      )}
    </div>
  );
}
