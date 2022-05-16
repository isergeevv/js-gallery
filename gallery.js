class Gallery {
    constructor({
        selector,
        main_image = true,
        extra_images = true,
        limit_extra_images = null,
        include_main_in_extra = false,
        transition_speed = 500,
        click_extra_open_modal = false,
        nav_buttons = false,
        main_follow_modal = true
    }) {
        this.images = Array();
        this.transition_speed = transition_speed;
        this.main_image = main_image;
        this.include_main_in_extra = include_main_in_extra;
        this.click_extra_open_modal = click_extra_open_modal;
        this.nav_buttons = nav_buttons;
        this.main_follow_modal = main_follow_modal;
        this.gallery = (typeof(selector) == 'string') ? document.querySelector(selector) : selector;

        for(let i = this.gallery.childElementCount-1; i >= 0 ; i--) {
            this.images.unshift({ src: this.gallery.children[i].src, alt: this.gallery.children[i].alt});
            this.gallery.children[i].remove();
        }

        let imgCount = this.images.length;

        if(!imgCount) return;
        
        const mainDiv = document.createElement('div');
        mainDiv.classList.add('jsg-main-image');
        mainDiv.setAttribute('jsg-image-id', '0');
        const mainImg = document.createElement('img');
        mainImg.src = this.images[0].src;
        mainImg.alt = this.images[0].alt;
        mainDiv.appendChild(mainImg);
        this.gallery.appendChild(mainDiv);

        if(this.main_image) this.addMainClickEvent(mainDiv);
        else mainDiv.style.display = 'none';

        if(imgCount <= 1) return;

        const oneExtra = (include_main_in_extra) ? 0 : 1;
        if(limit_extra_images && imgCount-oneExtra > limit_extra_images) imgCount = limit_extra_images + oneExtra;

        const extraDivContainer = document.createElement('div');
        extraDivContainer.classList.add('jsg-extra-images');
        let extraDiv, extraDivImg;
        for(let i = oneExtra; i < imgCount; i++) {
            extraDiv = document.createElement('div'); 
            extraDiv.classList.add('jsg-extra-image');
            extraDiv.setAttribute('jsg-image-id', i);
            extraDivImg = document.createElement('img');
            extraDivImg.setAttribute('src', this.images[i].src);
            extraDivImg.setAttribute('alt', this.images[i].alt);
            extraDiv.appendChild(extraDivImg);
            extraDivContainer.appendChild(extraDiv);
            this.addExtraClickEvent(extraDiv);
        }
        this.gallery.appendChild(extraDivContainer);

        if(extra_images) {
            this.addExtraImagesDrag(extraDivContainer);
            this.addExtraContainerScroll(extraDivContainer);

            window.addEventListener('touchmove', (e) => {
                if(!this.drag) return;
                const target = (this.drag == 1) ? this.gallery.querySelector('.jsg-extra-images') : this.modal.querySelector('.jsg-extra-images');
                target.scrollLeft = target.scrollLeft + (this.lastDragX - e.touches[0].pageX);
                this.lastDragX = e.touches[0].pageX;
            });
            window.addEventListener('mousemove', (e) => {
                if(!this.drag) return;
                const target = (this.drag == 1) ? this.gallery.querySelector('.jsg-extra-images') : this.modal.querySelector('.jsg-extra-images');
                target.scrollLeft = target.scrollLeft + (this.lastDragX - e.pageX);
                this.lastDragX = e.pageX;
                e.preventDefault();
            });
            window.addEventListener('mouseup', (e) => {
                this.drag = 0;
                e.preventDefault();
            });
        }
        else
            extraDivContainer.style.display = 'none';
        
        if(this.nav_buttons) {
            this.addNavBtns();
            this.appendBtns();
        }
    }

    addNavBtns() {
        this.btnLeft = document.createElement('div');
        this.btnLeft.classList = 'jsg-btn jsg-btn_left';
        this.btnLeft.innerText = '⏴';
        this.btnRight = document.createElement('div');
        this.btnRight.classList = 'jsg-btn jsg-btn_right';
        this.btnRight.innerText = '⏵';

        this.btnLeft.addEventListener('click', (e) => this.prevImage());
        this.btnRight.addEventListener('click', (e) => this.nextImage());
    }

    appendBtns() {
        if(!this.btnLeft && !this.btnRight) return;
        const element = this.modal || this.gallery;
        const mainDiv = element.querySelector('.jsg-main-image');
        mainDiv.appendChild(this.btnLeft);
        mainDiv.appendChild(this.btnRight);

        const currentMainImageId = mainDiv.getAttribute('jsg-image-id');
        const currentExtraImageEl = element.querySelector(`.jsg-extra-image[jsg-image-id="${currentMainImageId}"]`);
        this.toggleNavBtn('right', true);
        this.toggleNavBtn('left', true);
        if(!currentExtraImageEl.nextElementSibling)
            this.toggleNavBtn('right', false);
        else if((this.include_main_in_extra && !currentExtraImageEl.previousElementSibling) || currentMainImageId == 0)
            this.toggleNavBtn('left', false);
    }

    toggleNavBtn(btn, show) {
        const element = this.modal || this.gallery;
        const btnEl = element.querySelector(`.jsg-btn_${btn}`);
        if(btnEl) btnEl.style.display = (show ? 'block' : 'none');
    }

    prevImage() {
        const element = this.modal || this.gallery;
        const mainImageDiv = element.querySelector('.jsg-main-image');
        const prevImageId = Number(mainImageDiv.getAttribute('jsg-image-id')) - 1;
        const prevImageEl = element.querySelector(`.jsg-extra-image[jsg-image-id="${prevImageId}"] img`);
        if(prevImageEl) {
            const src = prevImageEl.getAttribute('src');
            mainImageDiv.setAttribute('jsg-image-id', prevImageId);
            mainImageDiv.querySelector('img').setAttribute('src', prevImageEl.getAttribute('src'));
            if(this.main_follow_modal && element == this.modal) {
                this.gallery.querySelector('.jsg-main-image').setAttribute('jsg-image-id', prevImageId);
                this.gallery.querySelector('.jsg-main-image img').setAttribute('src', src);
            }
            this.toggleNavBtn('right', true);
            if(!prevImageEl.parentElement.previousElementSibling)
                this.toggleNavBtn('left', (!this.include_main_in_extra && prevImageId == 1));
        }
        else {
            if(!this.include_main_in_extra && prevImageId == 0) {
                mainImageDiv.setAttribute('jsg-image-id', prevImageId);
                mainImageDiv.querySelector('img').setAttribute('src', this.images[0].src);
                if(this.main_follow_modal && element == this.modal) {
                    this.gallery.querySelector('.jsg-main-image').setAttribute('jsg-image-id', prevImageId);
                    this.gallery.querySelector('.jsg-main-image img').setAttribute('src', this.images[0].src);
                }
                this.toggleNavBtn('right', true);
            }
            this.toggleNavBtn('left', false);
        }
    }

    nextImage() {
        const element = this.modal || this.gallery;
        const mainImageDiv = element.querySelector('.jsg-main-image');
        const nextImageId = Number(mainImageDiv.getAttribute('jsg-image-id')) + 1;
        const nextImageEl = element.querySelector(`.jsg-extra-image[jsg-image-id="${(nextImageId)}"] img`);
        if(nextImageEl) {
            const src = nextImageEl.getAttribute('src');
            mainImageDiv.setAttribute('jsg-image-id', nextImageId);
            mainImageDiv.querySelector('img').setAttribute('src', src);
            if(this.main_follow_modal && element == this.modal) {
                this.gallery.querySelector('.jsg-main-image').setAttribute('jsg-image-id', nextImageId);
                this.gallery.querySelector('.jsg-main-image img').setAttribute('src', src);
            }
            this.toggleNavBtn('left', true);
            if(!nextImageEl.parentElement.nextElementSibling)
                this.toggleNavBtn('right', false);
        }
        else
            this.toggleNavBtn('right', false);
    }

    addMainClickEvent(el) {
        el.addEventListener('click', (e) => {
            // if nav buttons don't open
            if(e.target.classList.contains('jsg-btn'))    return;
            const clickImageImg = e.currentTarget.querySelector('img');
            const clickImageSrc = clickImageImg.getAttribute('src');
            const clickImageID = e.currentTarget.getAttribute('jsg-image-id');

            this.openGalleryModal(clickImageImg, clickImageSrc, clickImageID);
        });
    }

    addExtraClickEvent(el) {
        el.addEventListener('click', (e) => {
            const mainImageDiv = this.gallery.querySelector('.jsg-main-image');

            if(!this.click_extra_open_modal && this.main_image) {
                const clickImageID = e.currentTarget.getAttribute('jsg-image-id');
                if(clickImageID != mainImageDiv.getAttribute('jsg-image-id')) {
                    mainImageDiv.setAttribute('jsg-image-id', clickImageID);
                    mainImageDiv.querySelector('img').setAttribute('src', e.currentTarget.querySelector('img').getAttribute('src'));
                }
                this.appendBtns();
            }
            else {
                const clickImageImg = e.currentTarget.querySelector('img');
                const clickImageSrc = clickImageImg.getAttribute('src');
                const clickImageID = e.currentTarget.getAttribute('jsg-image-id');
                this.openGalleryModal(clickImageImg, clickImageSrc, clickImageID);
            }
        });
    }

    openGalleryModal(img, src, id) {
        this.modal = document.querySelector('.js-gallery-modal');
        if(this.modal) this.modal.remove();

        const imgRect = img.getBoundingClientRect();

        this.generateModal({ top: imgRect.top, left: imgRect.left }, imgRect.width, imgRect.height, src, id);

        this.generateCloseBtn();

        const modalExtraImagesDiv = this.generateModalExtraImageDivs();
        
        const modalBg = this.modal.querySelector('.modal-background');
        const mainDiv = this.modal.querySelector('.jsg-main-image');
        modalBg.style.transition = `all ${this.transition_speed}ms ease-in-out`;
        mainDiv.style.transition = `all ${this.transition_speed}ms ease-in-out`;

        setTimeout(() => {
            modalBg.style.opacity = '.9';
            mainDiv.style.width = '80%';
            mainDiv.style.height = '70%';
            mainDiv.style.top = '5%';
            mainDiv.style.left = '10%';
        }, 5);
        
        setTimeout(() => {
            this.modal.appendChild(modalExtraImagesDiv);
            this.modal.appendChild(this.closeBtn);
            this.addExtraContainerScroll(modalExtraImagesDiv);
            this.addExtraImagesDrag(modalExtraImagesDiv, true);
            this.appendBtns();
            if(this.main_follow_modal) {
                this.gallery.querySelector('.jsg-main-image').setAttribute('jsg-image-id', id);
                this.gallery.querySelector('.jsg-main-image img').setAttribute('src', src);
            }
        }, this.transition_speed);
    } 

    generateModal(imgOffset, width, height, src, id) {
        this.modal = document.createElement('div');
        this.modal.classList.add('js-gallery-modal');
        const modalBg = document.createElement('div');
        modalBg.classList.add('modal-background');
        modalBg.style.opacity = '0';
        const mainDiv = document.createElement('div');
        mainDiv.classList.add('jsg-main-image');
        mainDiv.setAttribute('jsg-image-id', id);
        mainDiv.style = `left: ${imgOffset.left}px; top: ${imgOffset.top}px; width: ${width}px; height: ${height}px;`;

        const mainImg = document.createElement('img');
        mainImg.setAttribute('src', src);
        mainImg.setAttribute('alt', id);
        mainDiv.appendChild(mainImg);
        this.modal.appendChild(modalBg);
        this.modal.appendChild(mainDiv);

        document.querySelector('body').appendChild(this.modal);

        this.modal.addEventListener('wheel', (e) => e.preventDefault());

        this.modal.addEventListener('click', (e) => {
            if(e.target.tagName !== 'IMG' && !e.target.classList.contains('jsg-extra-images') && !e.target.classList.contains('jsg-btn'))
                this.closeModal();
        });
    }

    generateCloseBtn() {
        this.closeBtn = document.createElement('div');
        this.closeBtn.classList = 'jsg-close-btn';
        this.closeBtn.innerHTML = '&times;';
        this.closeBtn.addEventListener('click', (e) => this.closeModal());
    }

    closeModal() {
        const element = this.modal;
        if(!element) return;
        this.modal = null;
        this.appendBtns();

        let img;
        if(this.main_image) img = this.gallery.querySelector(`[jsg-image-id='${element.querySelector('.jsg-main-image').getAttribute('jsg-image-id')}']`);
        else img = this.gallery.querySelector(`.jsg-extra-images .jsg-extra-image[jsg-image-id='${element.querySelector('.jsg-main-image').getAttribute('jsg-image-id')}']`);

        const imgRect = img.getBoundingClientRect();
        if(!imgRect.top && !imgRect.left) {
            element.remove();
            return;
        }

        const extraImages = element.querySelector('.jsg-extra-images');

        if(extraImages) extraImages.remove();
        this.closeBtn.remove();

        const modalBg = element.querySelector('.modal-background');
        const mainDiv = element.querySelector('.jsg-main-image');

        modalBg.style.opacity = '0';
        mainDiv.style.width = `${imgRect.width}px`;
        mainDiv.style.height = `${imgRect.height}px`;
        mainDiv.style.top = `${imgRect.top}px`;
        mainDiv.style.left = `${imgRect.left}px`;
        
        setTimeout(() => {
            element.remove();
        }, this.transition_speed);
    }

    generateModalExtraImageDivs() {
        const modalExtraImagesDiv = this.gallery.querySelector('.jsg-extra-images').cloneNode(true);
        const children = modalExtraImagesDiv.childElementCount;
        if(!children)   return;

        let child;
        for(let i = 0; i < children; i++) {
            child = modalExtraImagesDiv.children[i];
            child.addEventListener('click', (e) => {
                const mainImg = this.modal.querySelector('.jsg-main-image');
                mainImg.setAttribute('jsg-image-id', e.currentTarget.getAttribute('jsg-image-id'));
                mainImg.querySelector('img').setAttribute('src', e.currentTarget.querySelector('img').getAttribute('src'));
                if(this.main_follow_modal) {
                    const galleryMain = this.gallery.querySelector('.jsg-main-image');
                    galleryMain.setAttribute('jsg-image-id', e.currentTarget.getAttribute('jsg-image-id'));
                    galleryMain.querySelector('img').setAttribute('src', e.currentTarget.querySelector('img').getAttribute('src'));
                }
                this.appendBtns();
            });
        }
        return modalExtraImagesDiv;
    }

    addExtraContainerScroll(el) {
        el.addEventListener('wheel', (e) => {
            if(!e.deltaY) return;
            e.currentTarget.scrollLeft = e.currentTarget.scrollLeft + ((e.deltaY > 0) ? 50 : -50);
            e.preventDefault();
        });
    }

    addExtraImagesDrag(el, modal = false) {
        el.addEventListener('mousedown', (e) => {
            this.lastDragX = e.pageX;
            this.drag = (modal ? 2 : 1);
            e.preventDefault();
        });
        el.addEventListener('touchstart', (e) => {
            this.lastDragX = e.touches[0].pageX;
            this.drag = (modal ? 2 : 1);
        });
    }
}

(() => {
    const jsgElements = document.querySelectorAll('.js-gallery-html');
    if(!jsgElements.length) return;
    for(let i = 0; i < jsgElements.length; i++) {
        console.log(jsgElements[i]);
        const options = {
            selector: jsgElements[i],
            main_image: jsgElements[i].getAttribute('main_image'),
            extra_images: jsgElements[i].getAttribute('extra_images'),
            limit_extra_images: Number(jsgElements[i].getAttribute('limit_extra_images')),
            include_main_in_extra: jsgElements[i].getAttribute('include_main_in_extra'),
            click_extra_open_modal: jsgElements[i].getAttribute('click_extra_open_modal'),
            transition_speed: Number(jsgElements[i].getAttribute('transition_speed')),
            nav_buttons: jsgElements[i].getAttribute('nav_buttons'),
            main_follow_modal: jsgElements[i].getAttribute('main_follow_modal')
        }
        new Gallery(options);
    }
});