 $(document).ready(function() {
    // ==========================================
    // PAYMENT GATEWAY CONFIGURATION
    // ==========================================
    // URLs de pago predefinidas para diferentes montos
    // STRIPE - Reemplazar con URLs reales de Stripe checkout
    const stripePaymentLinks = {
        25: 'https://buy.stripe.com/cNidRa5AL5jlgGU5PXbEA04',
        50: 'https://buy.stripe.com/8x29AU1kv4fh2Q4fqxbEA06',
        100: 'https://buy.stripe.com/14A5kE1kv4fheyM6U1bEA07',
        500: 'https://buy.stripe.com/7sY7sMfbl6npcqE929bEA09',
        custom: 'https://buy.stripe.com/eVq9AUbZ95jl76kguBbEA05' // Link base para montos personalizados
    };
    
    // BANK TRANSFER INFO - Mercury (International) y Domestic Banks (USA)
    const bankTransferInfo = {
        international: {
            provider: 'Mercury',
            currency: 'USD',
            method: 'SWIFT International Wire',
            accountName: 'AIGenomicResources.com LLC',
            accountNumber: '202315706652',
            routingNumber: '091311229',
            bankName: 'Choice Financial Group',
            bankSwiftCode: 'CHFGUS44021',
            bankAddress: '4501 23rd Avenue S, Fargo, ND 58104, USA',
            description: 'International donations via SWIFT wire transfer through Mercury'
        },
        internationalFX: {
            provider: 'Mercury',
            currency: 'Foreign Currency',
            method: 'SWIFT International Wire',
            accountName: 'Choice Financial Group',
            accountNumber: '707567692',
            routingNumber: '021000021',
            bankName: 'JP Morgan Chase Bank, N.A. - New York',
            bankSwiftCode: 'CHASUS33',
            bankAddress: '383 Madison Avenue, Floor 23, New York, NY 10017, USA',
            remittanceInfo: '/FFC/202315706652/AIGenomicResources.com LLC/Sheridan, USA',
            description: 'International donations in foreign currency via SWIFT wire transfer through Mercury'
        },
        domestic: {
            banks: [
                {
                    name: 'Choice Financial Group',
                    method: 'Wire Transfer / ACH',
                    accountName: 'AIGenomicResources.com LLC',
                    accountNumber: '202315706652',
                    routingNumber: '091311229',
                    bankAddress: '4501 23rd Avenue S, Fargo, ND 58104',
                    accountType: 'Checking',
                    beneficiaryAddress: '30 North Gould Street, Ste R, Sheridan, WY 82801'
                }
            ]
        }
    };
    
    // Montos predefinidos disponibles
    const predefinedAmounts = [25, 50, 100, 500];
    
    // Initialize donation variables
    let selectedAmount = 0;
    let selectedPaymentMethod = 'stripe';
    let selectedCryptoType = 'usdt';
    let selectedNetwork = 'matic';
    
    // Crypto addresses
    const cryptoAddresses = {
        usdt: {
            matic: '0xfe54017ba47b007ae4a56598740a224461c348af',
            bsc: '0xfe54017ba47b007ae4a56598740a224461c348af',
            erc20: '0xfe54017ba47b007ae4a56598740a224461c348af',
            arbitrum: '0xfe54017ba47b007ae4a56598740a224461c348af'
        },
        usdc: {
            matic: '0xfe54017ba47b007ae4a56598740a224461c348af',
            bsc: '0xfe54017ba47b007ae4a56598740a224461c348af',
            erc20: '0xfe54017ba47b007ae4a56598740a224461c348af',
            arbitrum: '0xfe54017ba47b007ae4a56598740a224461c348af'
        },
        eth: {
            bsc: '0xfe54017ba47b007ae4a56598740a224461c348af',
            erc20: '0xfe54017ba47b007ae4a56598740a224461c348af',
            arbitrum: '0xfe54017ba47b007ae4a56598740a224461c348af'
        },
        btc: {
            native: '126CM7iDP5k8DZ9o4rk2FHd5mQJRZVhPdb',
            bep20: '0xfe54017ba47b007ae4a56598740a224461c348af'
        }
    };
    
    // Amount button click handlers
    $('.amount-btn').on('click', function() {
        $('.amount-btn').removeClass('active');
        $(this).addClass('active');
        selectedAmount = parseFloat($(this).data('amount')) || $(this).data('amount');
    });
    
    // Payment method change handler
    $('input[name="payment-method"]').on('change', function() {
        selectedPaymentMethod = $(this).val();
        if (selectedPaymentMethod === 'stripe') {
            $('#custom-btn').show();
        } else {
            $('#custom-btn').hide();
        }
        
        if (selectedPaymentMethod === 'crypto') {
            $('#crypto-options').slideDown();
            updateCryptoAddress();
        } else {
            $('#crypto-options').slideUp();
        }
    });
    
    // Crypto type change handler
    $('input[name="crypto-type"]').on('change', function() {
        selectedCryptoType = $(this).val();
        updateNetworkOptions();
        updateCryptoAddress();
    });
    
    // Network change handler
    $('input[name="network"]').on('change', function() {
        selectedNetwork = $(this).val();
        updateCryptoAddress();
    });
    
    // Copy address button handler
    $('#copy-address').on('click', function() {
        const address = $('#address-display').text();
        navigator.clipboard.writeText(address).then(function() {
            // Show success message
            const originalText = $('#copy-address').html();
            $('#copy-address').html('<i class="bi bi-check"></i> Copied!');
            
            setTimeout(function() {
                $('#copy-address').html(originalText);
            }, 2000);
        });
    });
    
    // Update network options based on selected crypto
    function updateNetworkOptions() {
        // Hide all network options
        $('#usdt-networks, #eth-networks, #btc-networks').hide();
        
        // Show appropriate network options
        if (selectedCryptoType === 'usdt' || selectedCryptoType === 'usdc') {
            $('#usdt-networks').show();
            // Set default network if needed
            if (!$('input[name="network"]:checked').length) {
                $('#matic').prop('checked', true);
                selectedNetwork = 'matic';
            }
        } else if (selectedCryptoType === 'eth') {
            $('#eth-networks').show();
            // Set default network if needed
            if (!$('input[name="network"]:checked').length) {
                $('#bsc-eth').prop('checked', true);
                selectedNetwork = 'bsc';
            }
        } else if (selectedCryptoType === 'btc') {
            $('#btc-networks').show();
            // Set default network if needed
            if (!$('input[name="network"]:checked').length) {
                $('#btc-native').prop('checked', true);
                selectedNetwork = 'native';
            }
        }
    }
    
    // Update crypto address display
    function updateCryptoAddress() {
        const address = cryptoAddresses[selectedCryptoType][selectedNetwork];
        $('#address-display').text(address);
        
        // Update QR code (in a real implementation, you would generate a QR code)
        $('#qr-code').attr('src', `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}`);
        
        // Update warning text
        const cryptoName = selectedCryptoType.toUpperCase();
        $('#crypto-warning-text').text(cryptoName);
    }
    
    // Form submission handler
    $('#donation-form').on('submit', function(e) {
        e.preventDefault();
        
        // Validate amount
        if (selectedAmount <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount',
                text: 'Please select or enter a valid donation amount',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        // Validate email
        const email = $('#donor-email').val();
        if (!email || !isValidEmail(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        // Process based on payment method
        if (selectedPaymentMethod === 'bluevine') {
            processBluevinePayment();
        } else if (selectedPaymentMethod === 'crypto') {
            showCryptoInstructions();
        } else {
            processStripePayment();
        }
    });
    
    // Show bank transfer instructions
    function processBluevinePayment() {
        showBankTransferInstructions();
    }
    
    // Show bank transfer options
    function showBankTransferInstructions() {
        let html = `
            <div style="text-align: left;">
                <p><strong>Select your location for bank transfer details:</strong></p>
                <div class="bank-options" style="margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <button class="btn btn-outline-primary btn-block" id="btn-international" style="text-align: left;">
                            <i class="bi bi-globe"></i> <strong>International (Outside USA)</strong>
                            <br><small>SWIFT Wire Transfer via Mercury</small>
                        </button>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <button class="btn btn-outline-primary btn-block" id="btn-international-fx" style="text-align: left;">
                            <i class="bi bi-globe"></i> <strong>International (Foreign Currency)</strong>
                            <br><small>SWIFT Wire Transfer via Mercury</small>
                        </button>
                    </div>
                    <div>
                        <button class="btn btn-outline-primary btn-block" id="btn-domestic" style="text-align: left;">
                            <i class="bi bi-house"></i> <strong>USA Domestic</strong>
                            <br><small>Wire Transfer / ACH</small>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'Bank Transfer Details',
            html: html,
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: function() {
                $('#btn-international').on('click', function() {
                    showInternationalBankDetails();
                });
                $('#btn-international-fx').on('click', function() {
                    showInternationalFXBankDetails();
                });
                $('#btn-domestic').on('click', function() {
                    showDomesticBankDetails();
                });
            }
        });
    }
    
    // Show international bank details (Mercury SWIFT)
       // ... (el código anterior a estas funciones no cambia) ...

    // Show international bank details (Mercury SWIFT - USD)
    function showInternationalBankDetails() {
        const info = bankTransferInfo.international;
        const html = `
            <div style="text-align: left; font-size: 14px;">
                 
                <!-- Receiving Bank Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Receiving Bank</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">SWIFT / BIC Code:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.bankSwiftCode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">ABA Routing Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.routingNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Bank Name:</td>
                            <td style="padding: 5px 0;">${info.bankName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Bank Address:</td>
                            <td style="padding: 5px 0;">${info.bankAddress}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Beneficiary Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Beneficiary</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">IBAN / Account Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.accountNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Beneficiary Name:</td>
                            <td style="padding: 5px 0;">${info.accountName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Beneficiary Address:</td>
                            <td style="padding: 5px 0;">30 North Gould Street, Ste R<br>Sheridan, WY 82801<br>USA</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'International Bank Transfer (USD)',
            html: html,
            icon: 'info',
            confirmButtonText: 'Got it ',
            confirmButtonColor: '#667eea',
            width: '600px'
        });
    }
    
    // Show international bank details for foreign currency (Mercury SWIFT)
    function showInternationalFXBankDetails() {
        const info = bankTransferInfo.internationalFX;
        const html = `
            <div style="text-align: left; font-size: 14px;">
             
                <!-- Remittance Information Block -->
                <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h5 style="color: #856404; margin-top: 0; margin-bottom: 10px; font-size: 1rem;">Remittance Information (Important)</h5>
                    <p style="margin: 0; font-family: monospace; word-break: break-all; font-size: 0.9rem;">${info.remittanceInfo}</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.85rem;">You are required to include the information above in the "Memo" or reference field.</p>
                </div>
                
                <!-- Receiving Bank Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Receiving Bank</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">SWIFT / BIC Code:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.bankSwiftCode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">ABA Routing Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.routingNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Bank Name:</td>
                            <td style="padding: 5px 0;">${info.bankName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Bank Address:</td>
                            <td style="padding: 5px 0;">${info.bankAddress}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Beneficiary Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Beneficiary</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">IBAN / Account Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${info.accountNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Beneficiary Name:</td>
                            <td style="padding: 5px 0;">${info.accountName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Beneficiary Address:</td>
                            <td style="padding: 5px 0;">4501 23rd Ave S<br>Fargo, ND 58104<br>USA</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'International Bank Transfer FX - Foreign Exchange (e.g. EUR, GBP, CAD, etc)',
            html: html,
            icon: 'info',
            confirmButtonText: 'Got it',
            confirmButtonColor: '#667eea',
            width: '600px'
        });
    }
    
    // Show domestic bank details (Wire / ACH)
    function showDomesticBankDetails() {
        const bank = bankTransferInfo.domestic.banks[0]; // Solo hay un banco en el array ahora
        const detailsHtml = `
            <div style="text-align: left; font-size: 14px;">
               
                <!-- Receiving Bank Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Receiving Bank</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">ABA Routing Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${bank.routingNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Bank Name:</td>
                            <td style="padding: 5px 0;">${bank.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Bank Address:</td>
                            <td style="padding: 5px 0;">${bank.bankAddress}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Beneficiary Block -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px;">
                    <h5 style="color: #343a40; margin-top: 0; margin-bottom: 15px; font-size: 1.1rem;">Beneficiary</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; width: 40%;">Beneficiary Name:</td>
                            <td style="padding: 5px 0;">${bank.accountName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Account Number:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${bank.accountNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600;">Type of Account:</td>
                            <td style="padding: 5px 0;">${bank.accountType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Beneficiary Address:</td>
                            <td style="padding: 5px 0;">${bank.beneficiaryAddress}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'USA Domestic Bank Transfer',
            html: detailsHtml,
            icon: 'info',
            confirmButtonText: 'Got it',
            confirmButtonColor: '#667eea',
            width: '600px'
        });
    }

    // ... (el resto del código después de estas funciones no cambia) ...
    // Show crypto instructions
    function showCryptoInstructions() {
        Swal.fire({
            icon: 'info',
            title: 'Cryptocurrency Donation',
            html: 'Please send your donation to the address shown in the form.<br>Make sure to select the correct network for your transaction.',
            confirmButtonColor: '#667eea'
        });
    }
    
    // Process Stripe payment - Redirect to Stripe payment link
    function processStripePayment() {
        const paymentUrl = getPaymentUrl('stripe');
        
        Swal.fire({
            icon: 'info',
            title: 'Redirecting to Stripe',
            text: 'You will be redirected to complete your secure payment via Stripe.',
            confirmButtonColor: '#667eea',
            didClose: function() {
                window.location.href = paymentUrl;
            }
        });
    }
    
    // Get payment URL based on amount and payment method
    function getPaymentUrl(method) {
        const links = method === 'stripe' ? stripePaymentLinks : stripePaymentLinks;
        
        // Check if amount matches a predefined amount
        if (links[selectedAmount]) {
            return links[selectedAmount];
        }
        
        // For custom amounts, use custom link
        return links.custom;
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
});