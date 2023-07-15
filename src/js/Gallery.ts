import { NAV_BUTTONS } from "./const";
import GalleryModal from "./GalleryModal";
import { GalleryImage, GalleryOptions } from "./types";

export default class Gallery {
  private _galleryEl: HTMLElement;
  private _modal: GalleryModal;
  private _btnLeftEl: HTMLElement;
  private _btnRightEl: HTMLElement;
  private _drag: boolean;
  private _click: boolean;
  private _lastDragX: number;

  private _images: GalleryImage[];
  private _options: GalleryOptions;

  constructor(options: GalleryOptions) {
    this._galleryEl = this.#getGalleryElement(options.selector);
    this._modal = new GalleryModal(this);

    this._drag = false;

    this._options = Object.assign(
      <GalleryOptions>{
        selector: "",
        images: [],
        mainImage: true,
        extraImages: true,
        excludeMainFromExtraImages: false,
        transitionSpeed: 500,
        enableModal: false,
        clickExtraOpenModal: false,
        navButtons: false,
        mainImageFollowModal: false,
        modal: {
          enable: true,
          clickExtraImageOpenModal: true,
          mainImageFollowModal: true,
        },
      },
      options
    );

    this._images = this.#collectImages();

    if (this._images.length > 0) {
      this.#buildGallery();
    }
  }

  get element() {
    return this._galleryEl;
  }
  get options() {
    return this._options;
  }
  get extraImagesContainer() {
    if (!this._galleryEl) {
      throw new Error(
        `[Gallery->extraImagesContainer] Missing gallery element.`
      );
    }

    const extraImagesContainerEl =
      this._galleryEl.querySelector(".jsg-extra-images");
    if (!extraImagesContainerEl) {
      throw new Error(
        `[Gallery->extraImagesContainer] Missing extra images container element for gallery.`
      );
    }

    return extraImagesContainerEl as HTMLElement;
  }
  get mainImageContainer() {
    if (!this._galleryEl) {
      throw new Error(`[Gallery->mainImageContainer] Missing gallery element.`);
    }

    const mainImageContainerEl =
      this._galleryEl.querySelector(".jsg-main-image");
    if (!mainImageContainerEl) {
      throw new Error(
        `[Gallery->mainImageContainer] Missing main image container element for gallery.`
      );
    }

    return mainImageContainerEl as HTMLElement;
  }
  get extraImageContainersContainer() {
    if (!this._galleryEl) {
      throw new Error(
        `[Gallery->extraImageContainersContainer] Missing gallery element.`
      );
    }

    const extraImageContainersContainerEl =
      this._galleryEl.querySelector(".jsg-extra-images");
    if (!extraImageContainersContainerEl) {
      throw new Error(
        `[Gallery->extraImageContainersContainer] Missing main image container element for gallery.`
      );
    }

    return extraImageContainersContainerEl as HTMLElement;
  }
  get images() {
    return this._images;
  }

  updateNavButtons() {
    const mainImageContainerEl = this.mainImageContainer;
    const extraImageContainersContainerEl = this.extraImageContainersContainer;
    const currentMainImageId = mainImageContainerEl.dataset.imageId;
    const currentExtraImageEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${currentMainImageId}"]`
    );
    if (!currentExtraImageEl) {
      throw new Error(
        "[Gallery->updateNavButtons] Missing current extra image element."
      );
    }
    this.#toggleNavBtn(
      NAV_BUTTONS.RIGHT,
      !!currentExtraImageEl.nextElementSibling
    );
    this.#toggleNavBtn(
      NAV_BUTTONS.LEFT,
      !!currentExtraImageEl.previousElementSibling
    );
  }

  updateMainImage(src: string, id: string) {
    const mainImageContainerEl = this.mainImageContainer;

    mainImageContainerEl.dataset.imageId = id;

    const img = mainImageContainerEl.querySelector("img");
    if (!img) {
      throw new Error("[Gallery->updateMainImage] Missing image element.");
    }
    img.src = src;

    this.updateNavButtons();
  }

  #getGalleryElement(selector: string | HTMLElement): HTMLElement {
    if (!selector) {
      throw new Error(`[Gallery] No selector provided.`);
    }

    if (typeof selector == "string") {
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error(
          `[Gallery] Could not find gallery element with selector ${selector}`
        );
      }

      return element as HTMLElement;
    }

    return selector;
  }

  #collectImages() {
    const images: GalleryImage[] = this._options.images
      ? [...this._options.images]
      : [];

    const childCount = this._galleryEl.childElementCount;
    for (let i = childCount - 1; i >= 0; i--) {
      const child = this._galleryEl.children[i];
      if (child.tagName !== "IMG") continue;

      images.unshift({
        src: (<HTMLImageElement>child).src,
        alt: (<HTMLImageElement>child).alt,
      });
      child.remove();
    }

    return images;
  }

  #buildGallery() {
    if (!this._galleryEl.classList.contains("jsg")) {
      this._galleryEl.classList.add("jsg");
    }

    const mainImageContainerEl = this.#generateMainImageContainer();

    this.#generateExtraImagesContainersContainer(mainImageContainerEl);

    if (this._options.navButtons) {
      this.#generateNavButtons();
    }
  }

  #generateMainImageContainer() {
    const mainImageContainerEl = document.createElement("div");
    mainImageContainerEl.classList.add("jsg-main-image");
    mainImageContainerEl.dataset.imageId = "0";
    mainImageContainerEl.addEventListener("click", (e: MouseEvent) => {
      if (!this._options.modal.enable || !e.target || !e.currentTarget) return;

      const target = e.target as HTMLDivElement;
      const currentTarget = e.currentTarget as HTMLElement;

      if (target.classList.contains("jsg-btn")) return;

      this.#openGalleryModal(currentTarget);
    });
    if (!this._options.mainImage) mainImageContainerEl.style.display = "none";

    this._galleryEl.appendChild(mainImageContainerEl);

    this.#generateMainImage();

    return mainImageContainerEl;
  }

  #generateMainImage(container?: HTMLElement) {
    if (!container) container = this.mainImageContainer;

    const mainImageEl = document.createElement("img");
    mainImageEl.src = this._images[0].src;
    mainImageEl.src = this._images[0].src;

    container.appendChild(mainImageEl);

    return mainImageEl;
  }

  #generateExtraImageContainers(
    mainImageContainerEl: HTMLElement,
    container?: HTMLElement
  ) {
    if (!container) container = this.extraImageContainersContainer;

    container.addEventListener("wheel", (e) => {
      if (!e.deltaY || !e.currentTarget) return;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      extraImageContainersContainerEl.scrollLeft =
        extraImageContainersContainerEl.scrollLeft + (e.deltaY > 0 ? 50 : -50);
      e.preventDefault();
    });

    container.addEventListener("pointerdown", (e) => {
      this._drag = true;
      this._click = true;
      this._lastDragX = e.pageX;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      if (e.target) {
        const target = e.target as HTMLElement;
        extraImageContainersContainerEl.dataset.targetImage =
          target.parentElement?.dataset.imageId || "";
      }

      this.extraImageContainersContainer.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    container.addEventListener("pointermove", (e) => {
      if (!this._drag) return;
      if (this._click) this._click = false;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      extraImageContainersContainerEl.scrollLeft =
        extraImageContainersContainerEl.scrollLeft +
        (this._lastDragX - e.pageX);

      this._lastDragX = e.pageX;
      e.preventDefault();
    });

    const onClickExtraImage = (target: HTMLElement) => {
      if (!target) {
        throw new Error("[Gallery->onClickExtraImage] Missing target element.");
      }
      if (!target.classList.contains("jsg-extra-image")) return;

      if (
        this._options.modal.enable &&
        this._options.modal.clickExtraImageOpenModal
      ) {
        this.#openGalleryModal(target);
      } else if (this._options.mainImage) {
        const clickImageID = target.dataset.imageId || "";
        const mainImageId = mainImageContainerEl.dataset.imageId || "";

        if (clickImageID != mainImageId) {
          mainImageContainerEl.dataset.imageId = clickImageID;
          const mainImageEl = mainImageContainerEl.querySelector("img");
          if (!mainImageEl) {
            throw new Error(
              `[Gallery->buildGallery] Missing main image element.`
            );
          }

          const clickImageImg = target.querySelector("img");
          if (!clickImageImg) {
            throw new Error(
              `[Gallery->buildGallery] Missing clicked image container image element.`
            );
          }

          const clickImageSrc = clickImageImg.getAttribute("src") || "";

          mainImageEl.setAttribute("src", clickImageSrc);

          this.#toggleNavBtn(NAV_BUTTONS.RIGHT, !!target.nextElementSibling);

          this.#toggleNavBtn(NAV_BUTTONS.LEFT, !!target.previousElementSibling);
        }
      }
    };

    let i = this._options.excludeMainFromExtraImages ? 1 : 0;
    while (i < this._images.length) {
      const extraDiv = document.createElement("div");
      extraDiv.classList.add("jsg-extra-image");
      extraDiv.dataset.imageId = i.toString();
      const extraDivImg = document.createElement("img");
      extraDivImg.setAttribute("src", this._images[i].src);
      extraDivImg.setAttribute("alt", this._images[i].alt);
      extraDiv.appendChild(extraDivImg);

      container.appendChild(extraDiv);

      i++;
    }

    window.addEventListener("pointerup", (e) => {
      if (!this._drag) return;

      const extraImageContainersContainerEl =
        this.extraImageContainersContainer;

      if (this._click && e.target) {
        const imageId =
          extraImageContainersContainerEl.dataset.targetImage || "";
        delete extraImageContainersContainerEl.dataset.targetImage;

        const target = extraImageContainersContainerEl.querySelector(
          `.jsg-extra-image[data-image-id="${imageId}"]`
        ) as HTMLElement;
        onClickExtraImage(target);
      }

      this._drag = false;
      extraImageContainersContainerEl.releasePointerCapture(e.pointerId);
      e.preventDefault();
    });
  }

  #generateExtraImagesContainersContainer(mainImageContainerEl: HTMLElement) {
    if (!mainImageContainerEl) mainImageContainerEl = this.mainImageContainer;

    const extraImageContainersContainerEl = document.createElement("div");
    extraImageContainersContainerEl.classList.add("jsg-extra-images");
    this._galleryEl.appendChild(extraImageContainersContainerEl);

    if (this._options.extraImages) {
      this.#generateExtraImageContainers(
        mainImageContainerEl,
        extraImageContainersContainerEl
      );
    } else {
      extraImageContainersContainerEl.style.display = "none";
    }

    return extraImageContainersContainerEl;
  }

  #generateNavButtons() {
    this._btnLeftEl = document.createElement("div");
    this._btnLeftEl.classList.add("jsg-btn", "jsg-btn_left");
    this._btnLeftEl.innerText = "⏴";
    this._btnRightEl = document.createElement("div");
    this._btnRightEl.classList.add("jsg-btn", "jsg-btn_right");
    this._btnRightEl.innerText = "⏵";

    this._btnLeftEl.addEventListener("click", () => this.#moveToPrevImage());
    this._btnRightEl.addEventListener("click", () => this.#moveToNextImage());

    const mainImageContainerEl = this.mainImageContainer;
    const extraImageContainersContainerEl = this.extraImageContainersContainer;
    mainImageContainerEl.appendChild(this._btnLeftEl);
    mainImageContainerEl.appendChild(this._btnRightEl);

    const currentMainImageId = mainImageContainerEl.dataset.imageId;
    const currentExtraImageEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${currentMainImageId}"]`
    );
    if (!currentExtraImageEl) {
      throw new Error(
        "[Gallery->generateNavButtons] Missing current extra image element."
      );
    }
    this.#toggleNavBtn(
      NAV_BUTTONS.RIGHT,
      !!currentExtraImageEl.nextElementSibling
    );
    this.#toggleNavBtn(
      NAV_BUTTONS.LEFT,
      !!currentExtraImageEl.previousElementSibling
    );
  }

  #moveToPrevImage() {
    const mainImageContainerEl = this.mainImageContainer;
    const mainImage = mainImageContainerEl.querySelector("img");
    if (!mainImage) {
      throw new Error("[Gallery->moveToPrevImage] Missing main image.");
    }
    const extraImageContainersContainerEl = this.extraImageContainersContainer;

    const curImageId = mainImageContainerEl.dataset.imageId;
    const curImageContainerEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${curImageId}"]`
    ) as HTMLElement;
    const prevImageContainerEl =
      curImageContainerEl.previousElementSibling as HTMLElement;

    if (prevImageContainerEl) {
      const prevImageEl = prevImageContainerEl.querySelector(
        `img`
      ) as HTMLElement;
      if (!prevImageEl) {
        throw new Error(
          "[Gallery->moveToPrevImage] Missing prev image element."
        );
      }
      const prevImageId = prevImageContainerEl.dataset.imageId;
      const src = prevImageEl.getAttribute("src") || "";

      mainImageContainerEl.dataset.imageId = prevImageId;
      mainImage.setAttribute("src", src);

      this.#toggleNavBtn(NAV_BUTTONS.RIGHT, true);
      this.#toggleNavBtn(
        NAV_BUTTONS.LEFT,
        !!prevImageEl.parentElement?.previousElementSibling
      );
    } else {
      mainImageContainerEl.dataset.imageId = "0";
      mainImage.setAttribute("src", this._images[0].src);
      this.#toggleNavBtn(
        NAV_BUTTONS.RIGHT,
        !!curImageContainerEl.nextElementSibling
      );
      this.#toggleNavBtn(NAV_BUTTONS.LEFT, false);
    }
  }

  #moveToNextImage() {
    const mainImageContainerEl = this.mainImageContainer;
    const mainImage = mainImageContainerEl.querySelector("img");
    if (!mainImage) {
      throw new Error("[Gallery->moveToPrevImage] Missing main image.");
    }
    const extraImageContainersContainerEl = this.extraImageContainersContainer;
    const nextImageId = Number(mainImageContainerEl.dataset.imageId) + 1;
    const nextImageEl = extraImageContainersContainerEl.querySelector(
      `.jsg-extra-image[data-image-id="${nextImageId}"] img`
    );

    if (nextImageEl) {
      const src = nextImageEl.getAttribute("src") || "";
      mainImageContainerEl.dataset.imageId = nextImageId.toString();
      mainImage.setAttribute("src", src);
      this.#toggleNavBtn(NAV_BUTTONS.LEFT, true);
      if (!nextImageEl.parentElement?.nextElementSibling) {
        this.#toggleNavBtn(NAV_BUTTONS.RIGHT, false);
      }
    } else {
      this.#toggleNavBtn(NAV_BUTTONS.RIGHT, false);
    }
  }

  #toggleNavBtn(btn: string, show: boolean) {
    const btnEl = this._galleryEl.querySelector(
      `.jsg-btn_${btn}`
    ) as HTMLElement;
    if (btnEl) btnEl.style.display = show ? "block" : "none";
  }

  #openGalleryModal(imgContainer: HTMLElement) {
    if (this._modal.isOpen) {
      this._modal.remove();
    }

    this._modal.create(imgContainer);
  }
}

