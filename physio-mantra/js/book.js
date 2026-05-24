/* js/book.js */
let currentVisitType = 'home';

function setVisitType(type) {
    currentVisitType = type;
    document.getElementById('visitType').value = type;
    const homeBtn = document.getElementById('homeVisitBtn');
    const clinicBtn = document.getElementById('clinicVisitBtn');
    if (type === 'home') {
        homeBtn.classList.add('active');
        clinicBtn.classList.remove('active');
    } else {
        clinicBtn.classList.remove('active');
        clinicBtn.classList.add('active');
    }
    clearError('visitTypeError');
}

function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = '';
    }
}

function validateForm() {
    let isValid = true;
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const service = document.getElementById('service').value;
    const preferredDate = document.getElementById('preferredDate').value;
    const preferredTime = document.getElementById('preferredTime').value;
    
    if (!name || name.length < 2) {
        showError('fullName', 'Please enter your full name (minimum 2 characters)');
        isValid = false;
    } else {
        clearError('fullName');
    }
    
    const phoneRegex = /^[\+]?[\d\s\-]{10,15}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
        showError('phone', 'Please enter a valid phone number (10-15 digits)');
        isValid = false;
    } else {
        clearError('phone');
    }
    
    if (!address || address.length < 10) {
        showError('address', 'Please enter your full address (minimum 10 characters)');
        isValid = false;
    } else {
        clearError('address');
    }
    
    if (!service) {
        showError('service', 'Please select a service');
        isValid = false;
    } else {
        clearError('service');
    }
    
    if (!preferredDate) {
        showError('preferredDate', 'Please select a preferred date');
        isValid = false;
    } else {
        const selectedDate = new Date(preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showError('preferredDate', 'Please select today or a future date');
            isValid = false;
        } else {
            clearError('preferredDate');
        }
    }
    
    if (!preferredTime) {
        showError('preferredTime', 'Please select a preferred time');
        isValid = false;
    } else {
        clearError('preferredTime');
    }
    
    return isValid;
}

document.addEventListener('DOMContentLoaded', function() {
    const homeBtn = document.getElementById('homeVisitBtn');
    const clinicBtn = document.getElementById('clinicVisitBtn');
    
    if (homeBtn && clinicBtn) {
        homeBtn.addEventListener('click', () => setVisitType('home'));
        clinicBtn.addEventListener('click', () => setVisitType('clinic'));
    }
    
    const form = document.getElementById('requestForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                const firstError = document.querySelector('.form-error:not(:empty)');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="ti ti-loader" style="animation: spin 1s linear infinite;"></i> Sending...';
            submitBtn.disabled = true;
            
            const formData = {
                name: document.getElementById('fullName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                visit_type: currentVisitType === 'home' ? 'Home Visit' : 'Clinic Visit',
                service: document.getElementById('service').value,
                preferred_date: document.getElementById('preferredDate').value,
                preferred_time: document.getElementById('preferredTime').value,
                notes: document.getElementById('notes').value.trim() || ''
            };
            
            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    document.getElementById('bookingForm').style.display = 'none';
                    const successDiv = document.getElementById('successMessage');
                    const successText = document.getElementById('successText');
                    successText.innerHTML = `Thank you, ${formData.name}. Our team will call you at <a href="tel:${formData.phone}">${formData.phone}</a> within a few hours.`;
                    successDiv.style.display = 'block';
                } else {
                    throw new Error(result.message || 'Something went wrong');
                }
            } catch (error) {
                alert('Unable to submit request. Please try again or call us directly.');
                console.error('Submission error:', error);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d+]/g, '');
            if (!value.startsWith('+')) {
                value = '+91 ' + value;
            }
            e.target.value = value;
        });
    }
    
    const refreshButton = document.querySelector('.success-card .btn-secondary');
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.reload();
        });
    }
});