import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

function showError(message) {
  iziToast.error({ message, position: 'topRight' });
}

function showEnd() {
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
  });
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}

async function onSubmit(event) {
  event.preventDefault();

  query = new FormData(form).get('search-text').trim();

  clearGallery();
  hideLoadMoreButton();

  if (!query) return;

  page = 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      showError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      return;
    }

    createGallery(data.hits);

    if (page * PER_PAGE < totalHits) {
      showLoadMoreButton();
    } else {
      showEnd();
    }
  } catch {
    showError('Something went wrong. Please try again later.');
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  page += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    createGallery(data.hits);
    scrollPage();

    if (page * PER_PAGE >= totalHits) {
      showEnd();
    } else {
      showLoadMoreButton();
    }
  } catch {
    page -= 1;
    showError('Something went wrong. Please try again later.');
    showLoadMoreButton();
  } finally {
    hideLoader();
  }
}

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);