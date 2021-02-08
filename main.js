// LIST OF PRODUCTS
let listOfProducts;
fetch('list-of-products.json')
.then(res => res.json())
.then(data => {
    listOfProducts = data.products;
    displayAllProducts();
    categoryButtons.forEach(button => button.addEventListener('click', () => {sortByCategory(button.dataset.category)}));
})
.catch(err => console.error(err));

// DOM ELEMENTS
const hamburgerButton = document.getElementById('hamburger-button');
const hamburgerCloseButton = document.getElementById('hamburger-close-button');
const cartButton = document.getElementById('cart-button');
const menuOptions = document.getElementById('menu-options');
const aboutUsPhoto = document.getElementById('about-us-photo');
const productsPanel = document.getElementById('products-panel');
const categoryButtons = document.querySelectorAll('.category-button');
const contentWrapper = document.querySelector('.content-wrapper');
const infoPopUpWrapper = document.getElementById('info-popup-wrapper');
const infoPopUp = document.querySelector('.info-popup');
const cartPopUpWrapper = document.getElementById('cart-popup-wrapper');
const cartPopUp = document.querySelector('.cart-popup');
const addToCartButton = document.getElementById('add-to-cart-button');
const showCartContentButton = document.getElementById('cart-content-button');

// APP DATA HANDLERS
let productsInCart = [];
let scrollY;

// FUNCTIONS
function makeProductCard(name, price, photo, category, id) {
    let productCardDiv = document.createElement('div');
    let productPhotoDiv = document.createElement('div');
    let productDescriptionDiv = document.createElement('div');
    productCardDiv.classList.add('product-card');
    productPhotoDiv.classList.add('product-photo');
    productPhotoDiv.innerHTML = `
    <img src="${photo}" alt="${name}">
    <div class="cart-icon icon"><i class="fas fa-shopping-cart"></i></div>
    <div class="info-icon icon"><i class="fas fa-info-circle"></i></div>
    `;
    productDescriptionDiv.classList.add('product-description');
    productDescriptionDiv.innerHTML = `
    <div class="add-to-cart-info">Produkt dodany do koszyka</div>
    <span class="product-name" data-category="${category}" data-plu="${id}">${name}</span>
    <span class="product-price">${price}zł</span>
    `;
    productCardDiv.appendChild(productPhotoDiv);
    productCardDiv.appendChild(productDescriptionDiv);
    return productCardDiv;
}

function updateCartContent() {
    document.getElementById('cart-content-quantity').textContent = productsInCart.length;

    if(productsInCart.length === 1) {
        document.getElementById('declination').textContent = "produkt"
    } else if (productsInCart.length > 1 && productsInCart.length < 5) {
        document.getElementById('declination').textContent = "produkty"
    } else {
        document.getElementById('declination').textContent = "produktów"
    }
}

function animateAddingToCart(productCard, addingWrapper) {
    if(productCard.classList.contains('product-card')) {
        document.querySelectorAll('.cart-icon').forEach(icon => icon.removeEventListener('click', addToCart));
        let addToCartInfo = productCard.querySelector('.add-to-cart-info');
        productCard.classList.add('bought');
        addToCartInfo.classList.add('bought');
        setTimeout(() => {
            document.querySelectorAll('.cart-icon').forEach(icon => icon.addEventListener('click', addToCart));
            productCard.classList.remove('bought');
            addToCartInfo.classList.remove('bought')
        }, 2000);
    } else {
        productCard.classList.add('bought');
        addToCartButton.classList.add('bought');
        addToCartButton.textContent = "Produkt dodany do koszyka";
        addToCartButton.removeEventListener('click', addingWrapper);
        setTimeout(() => {
            productCard.classList.remove('bought');
            addToCartButton.classList.remove('bought');
            addToCartButton.textContent = "Dodaj do koszyka";
            addToCartButton.addEventListener('click', addingWrapper);
        }, 2000);
    }

}

function addToCart() {
    const plu = this.parentNode.parentNode.querySelector('.product-name').dataset.plu;
    const product = listOfProducts.find(product => product.id === plu);
    productsInCart.push(product);
    animateAddingToCart(this.parentNode.parentNode)
    updateCartContent();
}

function addToCartFromPopup(product, productPhoto, addingWrapper) {
    productsInCart.push(product);
    animateAddingToCart(productPhoto, addingWrapper);
    updateCartContent();
}

function freezeContentWrapper() {
    scrollY = window.scrollY;
    contentWrapper.style.top = `-${scrollY}px`;
    contentWrapper.style.position = 'fixed';
    contentWrapper.classList.add('hidden');
}

function showInfoPopUp(e) {
    freezeContentWrapper();
    infoPopUpWrapper.classList.add('visible');
    infoPopUp.classList.add('visible');
    infoPopUp.querySelector('.popup-close-button').addEventListener('click', closeInfoPopUp);
    infoPopUpWrapper.addEventListener('click', closeInfoPopUp);
}

function closeInfoPopUp(e) {
    if(e.target === infoPopUp.querySelector('.fa-times') || e.target === infoPopUpWrapper) {
        contentWrapper.classList.remove('hidden');
        infoPopUpWrapper.classList.remove('visible');
        infoPopUp.classList.remove('visible');
        setTimeout(() => {
            contentWrapper.style.position = '';
            contentWrapper.style.top = ``;
            document.querySelector('html').style.scrollBehavior = 'auto';
            window.scrollTo(0, scrollY);
            document.querySelector('html').style.scrollBehavior = 'smooth';
        }, 500)
    }
}

function showCartPopUp() {
    freezeContentWrapper();
    cartPopUpWrapper.classList.add('visible');
    cartPopUp.classList.add('visible');
}

function generateProductInfo(plu) {
    const product = listOfProducts.filter(product => product.id === plu)[0];
    const productBrand = document.getElementById('product-brand');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productPhoto = document.getElementById('product-photo');
    const productProperties = document.getElementById('product-properties');
    productProperties.innerHTML = '';
    for(let i = 0; i<product.properties.length; i++) {
        const li = document.createElement('li');
        const leftSpan = document.createElement('span');
        const rightSpan = document.createElement('span');
        leftSpan.innerHTML = product.properties[i][0];
        rightSpan.innerHTML = product.properties[i][1];
        li.appendChild(leftSpan);
        li.appendChild(rightSpan);
        productProperties.appendChild(li);
    }
    productBrand.innerHTML = product.brand;
    productName.innerHTML = product.name;
    productPrice.innerHTML = `${product.price}zł`;
    productPhoto.querySelector('img').setAttribute('src', product.photo);

    function addingWrapper() {
        addToCartFromPopup(product, productPhoto, addingWrapper);
    }
    addToCartButton.addEventListener('click', addingWrapper);
}

function showProductInfo(product) {
    const plu = product.querySelector('.product-name').dataset.plu;
    generateProductInfo(plu);
    showInfoPopUp();
}

function displayAllProducts() {
    listOfProducts.forEach(p => productsPanel.appendChild(makeProductCard(p.name, p.price, p.photo, p.category, p.id)));
    mobileHoverEffectListening();
    addToCartListening();
    productInfoListening();
}

function sortByCategory(category) {
    productsPanel.innerHTML = ``;
    if(category === "all") {
        return displayAllProducts()
    }
    let productsToDisplay = listOfProducts.filter(product => product.category === category);
    productsToDisplay.forEach(p => productsPanel.appendChild(makeProductCard(p.name, p.price, p.photo, p.category, p.id)));
    mobileHoverEffectListening();
    addToCartListening();
    productInfoListening();
}

// EVENT LISTENERS
// "open menu" function
hamburgerButton.addEventListener('click', () => {
    hamburgerButton.classList.toggle('visible');
    hamburgerCloseButton.classList.toggle('visible');
    menuOptions.classList.toggle('active');
    document.getElementById('cart-content').classList.remove('active');
});

// "close menu" function
hamburgerCloseButton.addEventListener('click', () => {
    hamburgerButton.classList.toggle('visible');
    hamburgerCloseButton.classList.toggle('visible');
    menuOptions.classList.toggle('active')
});

// "show/hide cart" function
cartButton.addEventListener('click', () => {
    hamburgerButton.classList.add('visible');
    hamburgerCloseButton.classList.remove('visible');
    menuOptions.classList.remove('active');
    document.getElementById('cart-content').classList.toggle('active');
})

// mobile hover effect - photo "about us"
aboutUsPhoto.addEventListener('click', () => {aboutUsPhoto.classList.toggle('active')});

// mobile hover effect - product card
function mobileHoverEffectListening() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(productCard => productCard.addEventListener('click', (e) => {
        if(e.target.classList.contains('fa-shopping-cart') || e.target.classList.contains('fa-info-circle')) return
        if(productCard.classList.contains('active')) {
            productCards.forEach(card => card.classList.remove('active'));
        } else {
            productCards.forEach(card => card.classList.remove('active'));
            productCard.classList.toggle('active');
        };
    }));
}

// adding product to cart
function addToCartListening() {
    document.querySelectorAll('.cart-icon').forEach(icon => icon.addEventListener('click', addToCart));
}

// showing product info
function productInfoListening() {
    document.querySelectorAll('.info-icon').forEach(icon => icon.addEventListener('click', () => {
        showProductInfo(icon.parentNode.parentNode)
    }));
};

// showing cart content
showCartContentButton.addEventListener('click', showCartPopUp);