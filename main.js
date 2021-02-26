// LIST OF PRODUCTS
let listOfProducts;
fetch('list-of-products.json')
.then(res => res.json())
.then(data => {
    listOfProducts = data.products;
    currentDisplayingProducts = listOfProducts;
    displayAllProducts();
    divideProductsToPages(currentDisplayingProducts);
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
const showCartContentButton = document.getElementById('cart-content-button');
const searchInput = document.querySelector('#searching-panel input');
let addToCartButton;
let deleteFromCartButtons;

// APP DATA HANDLERS
let productsInCart = [];
let currentDisplayingProducts = [];
let dividedProducts = [];
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

function divideProductsToPages(arrayOfProducts) {
    dividedProducts = [];
    let index = 9;
    let subArrayIndex = -1;
    for (product of arrayOfProducts) {
        if(index === 9) {
            dividedProducts.push([]);
            index = 0;
            subArrayIndex++;
        }
        dividedProducts[subArrayIndex].push(product);
        index++;
    }
    generatePagesButtons();
    showOnePageOfProducts(1);
}

function generatePagesButtons() {
    document.getElementById('page-buttons-panel').innerHTML = '';
    let index = 1;
    for(page of dividedProducts) {
        const button = document.createElement('button');
        button.textContent = index;
        button.classList.add('page-button');
        document.getElementById('page-buttons-panel').appendChild(button);
        button.addEventListener('click', changeProductsPage);
        index++;
    }
}

function changeProductsPage() {
    const index = this.textContent / 1;
    showOnePageOfProducts(index);
}

function showOnePageOfProducts(pageNumber) {
    productsPanel.innerHTML = ``;
    const productsToDisplay = dividedProducts[pageNumber-1];
    productsToDisplay.forEach(p => productsPanel.appendChild(makeProductCard(p.name, p.price, p.photo, p.category, p.id)));
    mobileHoverEffectListening();
    addToCartListening();
    productInfoListening(); 
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

function showInfoPopUp() {
    freezeContentWrapper();
    infoPopUpWrapper.classList.add('visible');
    infoPopUp.classList.add('visible');
    infoPopUp.querySelector('.popup-close-button').addEventListener('click', closePopUp);
    infoPopUpWrapper.addEventListener('click', closePopUp);
}

function adjustContentWrapperPosition() {
    contentWrapper.style.position = '';
    contentWrapper.style.top = ``;
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollY);
    document.querySelector('html').style.scrollBehavior = 'smooth';
}

function closeInfoPopUp() {
    contentWrapper.classList.remove('hidden');
    infoPopUpWrapper.classList.remove('visible');
    infoPopUp.classList.remove('visible');
    document.getElementById('product-properties').innerHTML = '';
    adjustContentWrapperPosition();
}

function closeCartPopUp() {
    contentWrapper.classList.remove('hidden');
    cartPopUpWrapper.classList.remove('visible');
    cartPopUp.classList.remove('visible');
    adjustContentWrapperPosition();
    setTimeout(() => {
        document.getElementById('cart-popup-content').innerHTML = '';
    }, 500);
}

function closePopUp(e) {
    if(e.target === infoPopUp.querySelector('.fa-times') || e.target === infoPopUpWrapper) {
        closeInfoPopUp();
    } else if (e.target === cartPopUp.querySelector('.fa-times') || e.target === cartPopUpWrapper) {
        closeCartPopUp()
    }
}

function renderCartContent() {
    const cartPopUpContent = document.getElementById('cart-popup-content');
    if(!productsInCart.length) {
        cartPopUpContent.innerHTML = `<h2>Niczego tu jeszcze nie ma</h2>`;
    } else {
        cartPopUpContent.innerHTML = ``;
        const ul = document.createElement('ul');
        productsInCart.forEach(product => {
            const li = document.createElement('li');
            const photo = document.createElement('div');
            const properties = document.createElement('div');
            const buttons = document.createElement('div');
            const nameSpan = document.createElement('span');
            const priceSpan = document.createElement('span');
            const infoButton = document.createElement('button');
            const deleteButton = document.createElement('button');
            li.setAttribute('data-plu', `${product.id}`)
            photo.classList.add('product-photo');
            properties.classList.add('product-properties');
            buttons.classList.add('product-buttons');
            photo.innerHTML = `<img src="${product.photo}" alt="${product.name}" />`;
            nameSpan.classList.add('product-name');
            nameSpan.textContent = `${product.name}`;
            priceSpan.classList.add('product-price');
            priceSpan.textContent = `${product.price}zł`;
            infoButton.textContent = `Informacje`;
            deleteButton.textContent = `Usuń`;
            deleteButton.classList.add('delete-button');
            buttons.appendChild(infoButton);
            buttons.appendChild(deleteButton);
            properties.appendChild(nameSpan);
            properties.appendChild(priceSpan);
            li.appendChild(photo);
            li.appendChild(properties);
            li.appendChild(buttons);
            ul.appendChild(li);
            infoButton.addEventListener('click', switchToProductInfo);
        });
        cartPopUpContent.appendChild(ul);
        deleteFromCartButtons = [...document.querySelectorAll('.delete-button')];
        deleteFromCartButtons.forEach(button => button.addEventListener('click', deleteFromCart));
    }
}

function deleteFromCart() {
    const index = deleteFromCartButtons.indexOf(this);
    productsInCart.splice(index, 1);
    updateCartContent();
    renderCartContent();
}

function switchToProductInfo() {
    const plu = this.parentNode.parentNode.dataset.plu;
    closeCartPopUp(); 
    generateProductInfo(plu);
    replaceButtons();
    showInfoPopUp();
}

function replaceButtons() {
    const buttonWrapper = document.getElementById('button-wrapper');
    buttonWrapper.innerHTML = '';
    let button = document.createElement('button');
    button.classList.add('button');
    button.setAttribute('id', 'back-to-cart-button');
    button.textContent = 'Wróć do koszyka';
    buttonWrapper.appendChild(button);
    button.addEventListener('click', switchToCart);
}

function switchToCart() {
    closeInfoPopUp();
    showCartPopUp();
}

function showCartPopUp() {
    renderCartContent();
    freezeContentWrapper();
    cartPopUpWrapper.classList.add('visible');
    cartPopUp.classList.add('visible');
    cartPopUp.querySelector('.popup-close-button').addEventListener('click', closePopUp);
    cartPopUpWrapper.addEventListener('click', closePopUp);
}

function generateProductInfo(plu) {
    const product = listOfProducts.filter(product => product.id === plu)[0];
    const productProperties = document.getElementById('product-properties');
    const productPhoto = document.getElementById('product-photo').querySelector('img');
    productProperties.innerHTML = '';
    resetButtonWrapper();
    renderProductProperties(product, productProperties);
    document.getElementById('product-brand').innerHTML = product.brand;
    document.getElementById('product-name').innerHTML = product.name;
    document.getElementById('product-price').innerHTML = `${product.price}zł`;
    productPhoto.setAttribute('src', product.photo);
    function addingWrapper() {
        addToCartFromPopup(product, productPhoto, addingWrapper);
    }
    addToCartButton.addEventListener('click', addingWrapper);
}

function resetButtonWrapper() {
    const buttonWrapper = document.getElementById('button-wrapper');
    buttonWrapper.innerHTML = '';
    const addToCartBtn = document.createElement('button');
    addToCartBtn.classList.add('button');
    addToCartBtn.setAttribute('id', 'add-to-cart-button');
    addToCartBtn.textContent = `Dodaj do koszyka`;
    buttonWrapper.appendChild(addToCartBtn);
    addToCartButton = addToCartBtn;
}

function renderProductProperties(product, productProperties) {
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
}

function showProductInfo(product) {
    const plu = product.querySelector('.product-name').dataset.plu;
    generateProductInfo(plu);
    showInfoPopUp();
}

function displayAllProducts() {
    divideProductsToPages(listOfProducts);
    mobileHoverEffectListening();
    addToCartListening();
    productInfoListening();
    currentDisplayingProducts = listOfProducts;
}

function sortByCategory(category) {
    productsPanel.innerHTML = ``;
    if(category === "all") {
        return displayAllProducts()
    }
    let productsToDisplay = listOfProducts.filter(product => product.category === category);
    divideProductsToPages(productsToDisplay);
    mobileHoverEffectListening();
    addToCartListening();
    productInfoListening();
    currentDisplayingProducts = productsToDisplay;
}

function searchProducts(e) {
    productsPanel.innerHTML = ``;
    const lowerCaseInput = e.target.value.toLowerCase();
    const productsToDisplay = currentDisplayingProducts.filter(product => product.name.toLowerCase().includes(lowerCaseInput) || product.brand.toLowerCase().includes(lowerCaseInput));
    divideProductsToPages(productsToDisplay);
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

//searching products
searchInput.addEventListener('input', searchProducts);