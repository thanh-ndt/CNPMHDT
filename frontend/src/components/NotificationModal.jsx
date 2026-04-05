import React from 'react';

const NotificationModal = ({ 
    show, 
    onClose, 
    title, 
    message, 
    type = 'info', 
    confirmText = 'Đóng',
    onConfirm = null
}) => {
    if (!show) return null;

    // Determine the icon and text color based on the notification type
    const getIconInfo = () => {
        switch (type) {
            case 'success': 
                return { icon: 'bi bi-check-circle-fill', color: 'text-success' };
            case 'error': 
                return { icon: 'bi bi-x-circle-fill', color: 'text-danger' };
            case 'warning': 
                return { icon: 'bi bi-exclamation-triangle-fill', color: 'text-warning' };
            case 'info':
            default: 
                return { icon: 'bi bi-info-circle-fill', color: 'text-info' };
        }
    };

    const { icon, color } = getIconInfo();

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <div className="modal d-block align-items-center justify-content-center" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header border-0 pb-0 justify-content-end">
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body text-center pt-0 pb-4 px-4">
                        <div className="mb-3">
                            <i className={`${icon} ${color}`} style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-bold mb-3">{title}</h4>
                        <p className="text-secondary mb-4 fs-6">{message}</p>
                        
                        <div className="d-flex justify-content-center gap-2">
                            <button 
                                className={`btn ${type === 'error' ? 'btn-danger' : 'btn-dark'} rounded-pill px-5 py-2 fw-medium`} 
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
