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
    
    // BLUEVINE - Reemplazar con URLs reales de Bluevine
    const bluevinePaymentLinks = {
        25: 'https://buy.stripe.com/cNidRa5AL5jlgGU5PXbEA04',
        50: 'https://buy.stripe.com/8x29AU1kv4fh2Q4fqxbEA06',
        100: 'https://buy.stripe.com/14A5kE1kv4fheyM6U1bEA07',
        500: 'https://buy.stripe.com/7sY7sMfbl6npcqE929bEA09',
        custom: 'https://buy.stripe.com/eVq9AUbZ95jl76kguBbEA05' // Link base para montos personalizados
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
    
    // Show Bluevine instructions and redirect to payment
    function processBluevinePayment() {
        const paymentUrl = getPaymentUrl('bluevine');
        
        Swal.fire({
            icon: 'info',
            title: 'Redirecting to Bluevine',
            text: 'You will be redirected to complete your donation via Bluevine bank transfer.',
            confirmButtonColor: '#667eea',
            didClose: function() {
                window.location.href = paymentUrl;
            }
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
        const links = method === 'stripe' ? stripePaymentLinks : bluevinePaymentLinks;
        
        // Check if amount matches a predefined amount
        if (links[selectedAmount]) {
            return links[selectedAmount];
        }
        
        // For custom amounts, append to the custom link
        if (method === 'stripe') {
            // Stripe uses amount in cents
            return `${links.custom}`;
        } else {
            // Bluevine appends amount directly
            return `${links.custom}`;
        }
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
});