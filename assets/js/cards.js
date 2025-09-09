// Get the name from URL (e.g., /cards/arthur/ -> arthur)
const pathSegments = window.location.pathname.split('/');
const cardName = pathSegments[pathSegments.length - 2] || pathSegments[pathSegments.length - 3];

// Get URL parameters for custom image path
const urlParams = new URLSearchParams(window.location.search);
const customImagePath = urlParams.get('image');

// Update image sources and vCard link based on URL
function initializeCard() {
    const cardImage = document.getElementById('business-card-image');
    const vCardLink = document.getElementById('download-vcard-btn');

    if (cardName) {
        // Update image source - use custom path if provided, otherwise default
        if (customImagePath) {
            cardImage.src = `/${customImagePath}`;
        } else {
            cardImage.src = `/assets/img/cards/${cardName}.png`;
        }
        cardImage.alt = `${cardName.charAt(0).toUpperCase() + cardName.slice(1)} Business Card`;

        // Update fallback image in onerror
        cardImage.onerror = function () {
            this.src = `/assets/img/team/${cardName}.jpg`;
            this.onerror = function () {
                this.src = `/assets/img/team/TRO_TeamPictures_${cardName.charAt(0).toUpperCase() + cardName.slice(1)}.jpg`;
                this.onerror = null; // Prevent infinite loop
            };
        };

        // Update vCard link
        vCardLink.href = `/assets/vcards/${cardName}.vcf`;
        vCardLink.download = `${cardName.charAt(0).toUpperCase() + cardName.slice(1)}_Card.vcf`;

        // Update page title and meta tags
        document.title = `${cardName.charAt(0).toUpperCase() + cardName.slice(1)} - Troople Business Card`;

        // Update meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        const twitterUrl = document.querySelector('meta[property="twitter:url"]');
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        const description = document.querySelector('meta[name="description"]');

        const personName = cardName.charAt(0).toUpperCase() + cardName.slice(1);
        const cardUrl = `https://troople.be/cards/${cardName}`;
        const cardImageUrl = customImagePath ? `https://troople.be/${customImagePath}` : `https://troople.be/assets/cards/${cardName}-card.png`;
        const desc = `${personName}'s digital business card from Troople - AI and Data Science solutions.`;

        if (ogTitle) ogTitle.content = `${personName} - Troople Business Card`;
        if (ogDescription) ogDescription.content = desc;
        if (ogUrl) ogUrl.content = cardUrl;
        if (ogImage) ogImage.content = cardImageUrl;
        if (twitterTitle) twitterTitle.content = `${personName} - Troople Business Card`;
        if (twitterDescription) twitterDescription.content = desc;
        if (twitterUrl) twitterUrl.content = cardUrl;
        if (twitterImage) twitterImage.content = cardImageUrl;
        if (description) description.content = desc;
    }
}

// Save image to gallery
function saveImageToGallery() {
    const saveBtn = document.getElementById('save-image-btn');
    const cardImage = document.getElementById('business-card-image');

    saveBtn.classList.add('loading');

    // Create a canvas to convert image to blob
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
            // if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'business-card.png', { type: 'image/png' })] })) {
            //     // Use Web Share API if available (mobile devices)
            //     const file = new File([blob], `${cardName}_business_card.png`, { type: 'image/png' });
            //     navigator.share({
            //         files: [file],
            //         title: 'Business Card',
            //         text: `${cardName.charAt(0).toUpperCase() + cardName.slice(1)}'s Business Card`
            //     }).then(() => {
            //         saveBtn.classList.remove('loading');
            //         saveBtn.classList.add('success');
            //         downloadImage(blob);
            //         setTimeout(() => saveBtn.classList.remove('success'), 2000);
            //     }).catch((error) => {
            //         saveBtn.classList.remove('loading');
            //         console.error('Error sharing:', error);
            //     });
            // } else {
            //     // Fallback to download
            // }
            downloadImage(blob);
        }, 'image/png');
    };

    img.onerror = function () {
        saveBtn.classList.remove('loading');
    };

    img.src = cardImage.src;
}

// Download image as fallback
function downloadImage(blob) {
    const saveBtn = document.getElementById('save-image-btn');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cardName}_business_card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    saveBtn.classList.remove('loading');
    saveBtn.classList.add('success');
    setTimeout(() => saveBtn.classList.remove('success'), 2000);
}

// Handle vCard download
function handleVCardDownload() {
    const vCardBtn = document.getElementById('download-vcard-btn');
    vCardBtn.classList.add('success');
    setTimeout(() => vCardBtn.classList.remove('success'), 2000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    initializeCard();

    document.getElementById('save-image-btn').addEventListener('click', saveImageToGallery);
    document.getElementById('download-vcard-btn').addEventListener('click', handleVCardDownload);
});