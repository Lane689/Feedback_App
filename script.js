// -- GLOBAL -- 
const MAX_CHARS = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';
const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form'); 
const feedbackListEl = document.querySelector('.feedbacks')
const submitButtonEl = document.querySelector('.submit-btn')
const spinnerEl = document.querySelector('.spinner')
const hashtagListEl = document.querySelector('.hashtags')

const renderFeedbackItem = (feedbackItem) => {
    // new feedback item HTML
    const feedbackItemHTML = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">hi ${feedbackItem.text} </p>
            </div>
            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
        </li>
    `;
    feedbackListEl.insertAdjacentHTML('beforeend',feedbackItemHTML)
}

// -- COUNTER COMPONENT --
const inputHandler = () => {
    const maxNumberChars = MAX_CHARS;
    const numberOfTypedChars = textareaEl.value.length;
    const charsLeft = maxNumberChars - numberOfTypedChars;
    counterEl.textContent = charsLeft;
};
textareaEl.addEventListener('input', inputHandler);

// -- FORM COMPONENT --
const showVisualIndicator = (textCheck) => {
    const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
    formEl.classList.add(className);
    setTimeout(() => {
        formEl.classList.remove(className);
    } , 2000);
}

const submitHandler = (event) => {
    event.preventDefault();
    const text = textareaEl.value;
    if(text.includes("#") && text.length >= 5){
        showVisualIndicator('valid');
    } else {
        showVisualIndicator('invalid');
        textareaEl.focus();
        return;
    }

    const hashtag = text.split(' ').find(word => word.includes('#'));
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0,1).toUpperCase(); 
    const upvoteCount = 0;
    const daysAgo = 0;
    const feedbackItemObject = {
        upvoteCount: upvoteCount,
        badgeLetter: badgeLetter, 
        company: company,
        daysAgo: daysAgo,
        text: text
    };

    renderFeedbackItem(feedbackItemObject);
    fetch(`${BASE_API_URL}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItemObject),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(!response.ok) {
            console.log('Something went wrong');
            return;
        } 
        console.log('Successfull');
    }).catch(error => console.log(error));

    textareaEl.value = '';
    submitButtonEl.blur();
    counterEl.textContent = MAX_CHARS;
};
formEl.addEventListener('submit', submitHandler);

// -- FEEDBACK LIST COMPONENT -- 
const clickHandler = (event) => {
    const clickedEl = event.target;
    const upvoteIntention = clickedEl.className.includes('upvote');

    if(upvoteIntention){ 
        const upvoteButtonEl = clickedEl.closest('.upvote'); 
        upvoteButtonEl.disabled = true;
        const upvoteCountEl = upvoteButtonEl.querySelector('.upvote__count');
        let getUpvoteCount = +upvoteCountEl.textContent;
        upvoteCountEl.textContent = ++getUpvoteCount;
    } else {
        clickedEl.closest('.feedback').classList.toggle('feedback--expand'); 
    }
}

feedbackListEl.addEventListener('click', clickHandler)
fetch(`${BASE_API_URL}/feedbacks`)
    .then((response) => {
        return response.json();  
    })
    .then(data => { 
        spinnerEl.remove();
        data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem));
    })
    .catch(error => {
        feedbackListEl.textContent = `failed to fetch feedback items. Error message: ${error.message}`;
    });

// -- HASHTAG LIST COMPONENT -- 
const clickHashtagHandler = (event) => {
    const clickedEl = event.target;
    if(clickedEl.className === 'hashtags') return;
    const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim();
    feedbackListEl.childNodes.forEach(childNode => { 
        if(childNode.nodeType === 3) return; 
        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
        if(companyNameFromHashtag !== companyNameFromFeedbackItem){
            childNode.remove();  
        }
    }) 
};
hashtagListEl.addEventListener('click', clickHashtagHandler);
