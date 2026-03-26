import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfileApi, updateProfileApi, changePasswordApi } from '../api/userApi';
import { updateUser, logout } from '../redux/authSlice';
import { logoutApi } from '../api/authApi';
import '../styles/Profile.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '', dob: '', avatar: '' });
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('info');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfileApi();
                const u = res.data;

                let parsedDob = '';
                if (u.dob) {
                    const d = new Date(u.dob);
                    if (!isNaN(d.getTime())) {
                        const dd = String(d.getDate()).padStart(2, '0');
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const yyyy = d.getFullYear();
                        parsedDob = `${dd}/${mm}/${yyyy}`;
                    }
                }

                setProfileForm({
                    fullName: u.fullName || '',
                    phoneNumber: u.phoneNumber || '',
                    dob: parsedDob,
                    avatar: u.avatar || '',
                });
            } catch { }
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    
    const handleDobChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        
        let formattedVal = val;
        if (val.length >= 5) {
            formattedVal = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        } else if (val.length >= 3) {
            formattedVal = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        setProfileForm({ ...profileForm, dob: formattedVal });
    };

    const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });
        setLoadingProfile(true);
        try {
            // Chuyển đổi DD/MM/YYYY về chuẩn YYYY-MM-DD cho Backend
            let formattedDob = profileForm.dob;
            if (formattedDob) {
                const parts = formattedDob.split('/');
                if (parts.length === 3) {
                    formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            const dataToSubmit = { ...profileForm, dob: formattedDob };
            const res = await updateProfileApi(dataToSubmit);
            dispatch(updateUser(res.data.user));
            setProfileMsg({ type: 'success', text: res.data.message });
        } catch (err) {
            setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Cập nhật thất bại.' });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg({ type: '', text: '' });
        if (passForm.newPassword !== passForm.confirmNewPassword) {
            return setPassMsg({ type: 'danger', text: 'Mật khẩu xác nhận không khớp.' });
        }
        setLoadingPass(true);
        try {
            const res = await changePasswordApi({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
            setPassMsg({ type: 'success', text: res.data.message });
            setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setPassMsg({ type: 'danger', text: err.response?.data?.message || 'Đổi mật khẩu thất bại.' });
        } finally {
            setLoadingPass(false);
        }
    };

    const handleLogout = async () => {
        try { await logoutApi(); } catch { }
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="profile-wrapper">
            <div className="container profile-container">
                <div className="row g-4">
                    {/* ====== SIDEBAR TRÁI ====== */}
                    <div className="col-12 col-md-4 col-lg-3">
                        <div className="profile-card sidebar-card h-100">
                            <div className="sidebar-header">
                                <div className="profile-avatar mb-3">
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="profile-name">{user?.fullName || 'Chưa đặt tên'}</h4>
                                <p className="profile-email">{user?.email}</p>
                                <span className={`profile-role-badge ${user?.role === 'owner' ? 'role-owner' : 'role-customer'}`}>
                                    {user?.role === 'owner' ? 'Chủ cửa hàng' : 'Khách hàng'}
                                </span>
                            </div>

                            <hr className="sidebar-divider" />

                            <ul className="sidebar-menu">
                                <li>
                                    <button className={`sidebar-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                                        <i className="bi bi-person me-3"></i> Thông tin cá nhân
                                    </button>
                                </li>
                                <li>
                                    <button className={`sidebar-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                                        <i className="bi bi-shield-lock me-3"></i> Đổi mật khẩu
                                    </button>
                                </li>
                            </ul>

                            <hr className="sidebar-divider" />

                            <div className="sidebar-footer">
                                <button className="btn btn-outline-danger w-100 custom-logout-btn" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ====== NỘI DUNG PHẢI ====== */}
                    <div className="col-12 col-md-8 col-lg-9">
                        <div className="profile-card h-100">

                            {/* NỘI DUNG GIAO DIỆN THÔNG TIN CÁ NHÂN */}
                            {activeTab === 'info' && (
                                <>
                                    <div className="profile-content-header">
                                        <h3 className="profile-section-title">Hồ Sơ Của Bạn</h3>
                                    </div>
                                    <div className="profile-content-body">
                                        {profileMsg.text && (
                                            <div className={`alert alert-${profileMsg.type} py-2 d-flex align-items-center mb-4`}>
                                                <i className={`bi bi-${profileMsg.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
                                                {profileMsg.text}
                                            </div>
                                        )}
                                        <form onSubmit={handleUpdateProfile}>
                                            <div className="row">
                                                <div className="col-12 col-md-6 mb-4">
                                                    <label className="form-label-custom">Họ và tên</label>
                                                    <div className="custom-input-group">
                                                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                                                        <input type="text" name="fullName" className="form-control" placeholder="Ví dụ: Nguyễn Văn A" value={profileForm.fullName} onChange={handleProfileChange} />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 mb-4">
                                                    <label className="form-label-custom">Số điện thoại</label>
                                                    <div className="custom-input-group">
                                                        <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                                                        <input type="tel" name="phoneNumber" className="form-control" placeholder="0901234567" value={profileForm.phoneNumber} onChange={handleProfileChange} />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 mb-4">
                                                    <label className="form-label-custom">Ngày sinh</label>
                                                    <div className="custom-input-group">
                                                        <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                                                        <input type="text" name="dob" className="form-control" placeholder="DD/MM/YYYY" value={profileForm.dob} onChange={handleDobChange} maxLength={10} />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 mb-4">
                                                    <label className="form-label-custom">Đường dẫn Ảnh đại diện</label>
                                                    <div className="custom-input-group">
                                                        <span className="input-group-text"><i className="bi bi-image"></i></span>
                                                        <input type="text" name="avatar" className="form-control" placeholder="https://..." value={profileForm.avatar} onChange={handleProfileChange} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-end mt-2">
                                                <button type="submit" className="btn-gradient" disabled={loadingProfile}>
                                                    {loadingProfile ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : 'Lưu Thay Đổi'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}

                            {/* NỘI DUNG GIAO DIỆN ĐỔI MẬT KHẨU */}
                            {activeTab === 'password' && (
                                <>
                                    <div className="profile-content-header">
                                        <h3 className="profile-section-title">Bảo Mật Tài Khoản</h3>
                                    </div>
                                    <div className="profile-content-body">
                                        {passMsg.text && (
                                            <div className={`alert alert-${passMsg.type} py-2 d-flex align-items-center mb-4`}>
                                                <i className={`bi bi-${passMsg.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
                                                {passMsg.text}
                                            </div>
                                        )}
                                        <form onSubmit={handleChangePassword}>
                                            <div className="mb-4">
                                                <label className="form-label-custom">Mật khẩu hiện tại</label>
                                                <div className="custom-input-group">
                                                    <span className="input-group-text"><i className="bi bi-shield-lock"></i></span>
                                                    <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" className="form-control" placeholder="Nhập để xác thực" value={passForm.currentPassword} onChange={handlePassChange} required />
                                                    <button type="button" className="btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                        <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label-custom">Mật khẩu mới</label>
                                                <div className="custom-input-group">
                                                    <span className="input-group-text"><i className="bi bi-key"></i></span>
                                                    <input type={showNewPassword ? "text" : "password"} name="newPassword" className="form-control" placeholder="Ít nhất 6 ký tự" value={passForm.newPassword} onChange={handlePassChange} required />
                                                    <button type="button" className="btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                        <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label-custom">Xác nhận mật khẩu mới</label>
                                                <div className="custom-input-group">
                                                    <span className="input-group-text"><i className="bi bi-check-circle"></i></span>
                                                    <input type={showConfirmNewPassword ? "text" : "password"} name="confirmNewPassword" className="form-control" placeholder="Nhập lại mật khẩu mới" value={passForm.confirmNewPassword} onChange={handlePassChange} required />
                                                    <button type="button" className="btn" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                                        <i className={`bi bi-eye${showConfirmNewPassword ? '-slash' : ''}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-end mt-2">
                                                <button type="submit" className="btn-gradient" disabled={loadingPass}>
                                                    {loadingPass ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</> : 'Cập Nhật Mật Khẩu'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
