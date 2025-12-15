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
            accountNumber: '202315706652', // Reemplazar con número real
            routingNumber: '091311229', // Reemplazar con routing real
            bankName: 'Choice Financial Group',
            bankSwiftCode: 'CHFGUS44021', // Reemplazar con SWIFT code real
            bankAddress: ' 4501 23rd Avenue S Fargo, ND 58104',
            description: 'International donations via SWIFT wire transfer through Mercury'
        },
        domestic: {
            banks: [
                {
                    name: 'Choice Financial Group',
                    method: 'Wire Transfer / ACH',
                    accountName: 'AIGenomicResources.com LLC',
                    accountNumber: '202315706652',
                    routingNumber: '091311229',
                    bankAddress: ' 4501 23rd Avenue SFargo, ND 58104'
                },
                {
                    name: 'Bluevine',
                    method: 'Wire Transfer / ACH',
                    accountName: 'AIGenomicResources.com LLC',
                    accountNumber: '875105077601',
                    routingNumber: '125109019',
                    bankAddress: 'Available via Bluevine'
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
        }else {
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
                    <div>
                        <button class="btn btn-outline-primary btn-block" id="btn-domestic" style="text-align: left;">
                            <i class="bi bi-usa"></i> <strong>USA Domestic</strong>
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
                $('#btn-domestic').on('click', function() {
                    showDomesticBankDetails();
                });
            }
        });
    }
    
    // Show international bank details (Mercury SWIFT)
    function showInternationalBankDetails() {
        const info = bankTransferInfo.international;
        const html = `
            <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h5 style="color: #667eea; margin-bottom: 15px;">
                    <i class="bi bi-bank"></i> International Wire Transfer (SWIFT)
                </h5>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600; width: 40%;">Bank:</td>
                        <td style="padding: 10px;">${info.bankName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600;">Account Name:</td>
                        <td style="padding: 10px;">${info.accountName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600;">Account Number:</td>
                        <td style="padding: 10px; font-family: monospace;">${info.accountNumber}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600;">Routing Number:</td>
                        <td style="padding: 10px; font-family: monospace;">${info.routingNumber}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600;">SWIFT Code:</td>
                        <td style="padding: 10px; font-family: monospace;">${info.bankSwiftCode}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 10px; font-weight: 600;">Bank Address:</td>
                        <td style="padding: 10px;">${info.bankAddress}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: 600;">Currency:</td>
                        <td style="padding: 10px;">${info.currency}</td>
                    </tr>
                </table>
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin-top: 15px;">
                    <i class="bi bi-info-circle"></i> <strong>Important:</strong> Please use your bank's international wire transfer service and provide the SWIFT code above.
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'International Bank Transfer',
            html: html,
            icon: 'info',
            confirmButtonText: 'Got it',
            confirmButtonColor: '#667eea'
        });
    }
    
    // Show domestic bank details (Wire / ACH)
    function showDomesticBankDetails() {
        const banks = bankTransferInfo.domestic.banks;
        const html = `
            <div style="text-align: left;">
                <p><strong>Choose a bank for your domestic transfer:</strong></p>
                <div style="margin-top: 15px;">
                    ${banks.map((bank, idx) => `
                        <button class="btn btn-outline-secondary btn-block" onclick="showBankDetails(${idx})" style="text-align: left; margin-bottom: 10px;">
                            <i class="bi bi-bank"></i> <strong>${bank.name}</strong>
                            <br><small>${bank.method}</small>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        window.showBankDetails = function(bankIdx) {
            const bank = banks[bankIdx];
            const detailsHtml = `
                <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h5 style="color: #667eea; margin-bottom: 15px;">
                        <i class="bi bi-bank"></i> ${bank.name}
                    </h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 10px; font-weight: 600; width: 40%;">Bank:</td>
                            <td style="padding: 10px;">${bank.name}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 10px; font-weight: 600;">Method:</td>
                            <td style="padding: 10px;">${bank.method}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 10px; font-weight: 600;">Account Name:</td>
                            <td style="padding: 10px;">${bank.accountName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 10px; font-weight: 600;">Account Number:</td>
                            <td style="padding: 10px; font-family: monospace;">${bank.accountNumber}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 10px; font-weight: 600;">Routing Number:</td>
                            <td style="padding: 10px; font-family: monospace;">${bank.routingNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: 600;">Bank Address:</td>
                            <td style="padding: 10px;">${bank.bankAddress}</td>
                        </tr>
                    </table>
                    <div style="background: #d1ecf1; border: 1px solid #0c5460; border-radius: 6px; padding: 12px; margin-top: 15px;">
                        <i class="bi bi-info-circle"></i> <strong>Note:</strong> Both Wire Transfer and ACH methods are available.
                    </div>
                </div>
            `;
            
            Swal.fire({
                title: bank.name + ' - Bank Details',
                html: detailsHtml,
                icon: 'info',
                confirmButtonText: 'Got it',
                confirmButtonColor: '#667eea'
            });
        };
        
        Swal.fire({
            title: 'USA Domestic Bank Transfer',
            html: html,
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false
        });
    }
    
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