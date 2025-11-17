 $(document).ready(function() {
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
        selectedAmount = $(this).data('amount');
        $('#custom-amount').val('');
    });
    
    // Custom amount input handler
    $('#custom-amount').on('input', function() {
        $('.amount-btn').removeClass('active');
        selectedAmount = parseFloat($(this).val()) || 0;
    });
    
    // Payment method change handler
    $('input[name="payment-method"]').on('change', function() {
        selectedPaymentMethod = $(this).val();
        $('#bluevine-instructions').hide();
        
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
            showBluevineInstructions();
        } else if (selectedPaymentMethod === 'crypto') {
            showCryptoInstructions();
        } else {
            processStripePayment();
        }
    });
    
    // Show Bluevine instructions
    function showBluevineInstructions() {
        const reference = 'DON-' + Date.now();
        $('#bluevine-reference').text(reference);
        $('#bluevine-instructions').slideDown();
        
        Swal.fire({
            icon: 'info',
            title: 'Bank Transfer Instructions',
            html: 'Please complete the transfer using the details shown below.<br>Your reference code is: <strong>' + reference + '</strong>',
            confirmButtonColor: '#667eea'
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
    
    // Process Stripe payment
    function processStripePayment() {
        $('#payment-processing').show();
        $('#donate-btn').prop('disabled', true);
        
        // Create Stripe checkout session
        const donationData = {
            amount: selectedAmount * 100, // Convert to cents
            email: $('#donor-email').val(),
            message: $('#donor-message').val(),
            currency: 'usd'
        };
        
        // Make API call to create Stripe session
        axios.post('/api/create-stripe-session/', donationData)
            .then(function(response) {
                // Redirect to Stripe Checkout
                window.location.href = response.data.session_url;
            })
            .catch(function(error) {
                console.error('Stripe session creation failed:', error);
                $('#payment-processing').hide();
                $('#donate-btn').prop('disabled', false);
                
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Error',
                    text: 'Unable to process payment. Please try again or contact support.',
                    confirmButtonColor: '#667eea'
                });
            });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
});