import $ from 'jquery';
import Cookies from 'js-cookie';

// user 아이콘 누르면 profile 뜸
$(document).ready(() => {
    resizeProfileHeight();
    resizeProfileContainerHeight();
});

function resizeProfileContainer() {
    let body = $('body');
    let profile = $('#profile');
    let profileContainer = $('#profile .container');

    if (profile.innerHeight() <= body.innerHeight()) {
        body.css('height', '100%');
        profile.css('height', '100%');
        profileContainer.css('height', '100%');
    }

    if (profileContainer.prop('scrollHeight') > body.innerHeight()) {
        body.css('height', '');
        profile.css('height', '');
        profileContainer.css('height', '');
    }
}

window.initializeProfile = () => {
    getProfile();
    readMyPosts();
};

/* JS */
// 회원 정보 수정 열기 모달
window.openEditProfileModal = () => {
    $('#modal-post').css('display', 'flex');
};

//회원 정보 수정 취소 모달
//이부분이 꼭 필요한지에 대해서 예기해보기(프로필 모달을 받으면 어차피 reload해주면 되니까)
window.closeEditProfileModal = () => {
    $('#modal-post').css('display', 'none');
    window.location.reload();
};

function resizeProfileHeight() {
    let profile = $('#profile');

    if (profile.height() < $('body').height()) {
        profile.css('height', '100%');
    }
    else {
        profile.css('height', '');
    }
}

function resizeProfileContainerHeight() {
    let profileContainer = $('#profile .container');

    if (profileContainer.height() < $('body').height()) {
        profileContainer.css('height', '100%');
    }
    else {
        profileContainer.css('height', '');
    }
}

/* 회원 탈퇴 */
window.withdrawal = () => {
    withdrawal();
};

/* AJAX */
// 회원 정보 받아서 그리기
function getProfile() {
    let token = Cookies.get('token');
    $.ajax({
        type: 'GET',
        url: process.env.BACKEND_HOST + '/user',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            $('#profile_box').empty();
            let user = response;
            let profileImage = user['profileImageUrl'];
            let nickname = user['nickname'];
            let github = user['githubUrl'];
            let portfolio = user['portfolioUrl'];
            let introduction = user['introduction'];

            if (github == '' || github == null) {
                github = '';
            }

            if (portfolio == '' || portfolio == null) {
                portfolio = '';
            }

            if (introduction == '' || introduction == null) {
                introduction = '';
            }
            console.log(profileImage, nickname, github, portfolio, introduction);

            let tempHtml = `<article class="media">
                            <figure class="media-left" style="align-self: center;">
                                <a class="image is-128x128" href="#">
                                    <img class="is-rounded" style="border-radius: 50%;"
                                    src="${profileImage}">
                                </a>
                            </figure>
                        </article>
                        <button id="logoutbtn" class="button buttonDefault has-text-centered is-rounded" onclick="logout()">로그아웃</button>
                        <button id="logoutbtn" class="button buttonDefault has-text-centered is-rounded" aria-label="edit" style="float: right;" onclick="openEditProfileModal('${profileImage}','${nickname}','${github}','${portfolio}','${introduction}')">프로필 수정</button>
                        <nav class="level is-mobile" style="margin-top:2rem; font-size: x-large">
                            <div class="media-content content">
                                <p>
                                    <span><strong style="font-weight: bold; font-size: x-large">@${nickname}</strong></span><br><br>
                                    <a href="${github}" target="_blank"><i class="fa-brands fa-github-alt" style="font-size: xxx-large"
                                            aria-hidden="ture"></i></a><br>
                                    <a href="${portfolio}" target="_blank">${portfolio}</a><br>
                                    <span style="font-size: large;">${introduction}</span>
                                </p>
                            </div>
                        </nav>`;
            $('#profile_box').append(tempHtml);
            $('#edit-profile-modal-background').on('click', closeEditProfileModal);
            $('#edit-profile-modal-close-btn').on('click', closeEditProfileModal);
            $('#nickname').text(nickname);
            resizeProfileContainer();
            getPosts();
        },
        error: function (response) {
            console.log(response);
            if (response.status == 403) {
                window.openLoginModal();
            }
        }
    }
    );
}

// 회원 정보 수정 모달
window.openEditProfileModal = (profileImage, nickname, github, portfolio, introduction) => {
    if (github == '' || github == null) {
        github = '';
    }
    if (portfolio == '' || portfolio == null) {
        portfolio = '';
    }
    if (introduction == '' || introduction == null) {
        introduction = '';
    }

    $('#modal-post').addClass('is-active');
    $('#nickname').val(`${nickname}`);
    $('#profileImage').val(`${profileImage}`);
    $('#githubUrl').val(`${github}`);
    $('#portfolioUrl').val(`${portfolio}`);
    $('#introduction').val(`${introduction}`);
};

function closeEditProfileModal() {
    $('#modal-post').removeClass('is-active');
    editProfileContentDelete();
}

// TODO: password, iamge, techStacks 보류! => 추후 보완 예정
// 프로필 정보 수정
// function editProfile() {
window.editProfile = () => {
    let nickname = $('#nickname').val();
    let githubUrl = $('#githubUrl').val();
    let portfolioUrl = $('#portfolioUrl').val();
    let introduction = $('#introduction').val();
    let profileImage = $('input[name="image"]').get(0).files[0];
    let formData = new FormData();
    console.log(nickname, githubUrl, portfolioUrl, introduction, profileImage);

    // formData로 바꿔주는 부분.
    // 이미 formData.append로 해줘서 따로 dat:{} 받을 필요없음.
    formData.append('nickname', nickname);

    if (!profileImage == '') {
        formData.append('file', profileImage);
    }

    if (!githubUrl == '') {
        formData.append('githubUrl', githubUrl);
    }

    if (!portfolioUrl == '') {
        formData.append('portfolioUrl', portfolioUrl);
    }

    if (!introduction == '') {
        formData.append('introduction', introduction);
    }

    let token = Cookies.get('token');

    $.ajax({
        type: 'PUT',
        url: process.env.BACKEND_HOST + '/user',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: false,
        processData: false,
        enctype: 'multipart/form-data',
        data: formData,
        success: function () {
            alert('수정이 완료되었습니다.');
            window.location.reload();
            changeScreen(SCREEN['HOME']);
        },
        error: function (response) {
            console.log(response);
            if (response.status == 400) {
                alert('이미지 파일만 첨부해주세요!');
            }
            else {
                alert('프로필 수정에 실패하였습니다.');
            }
        }
    });
};

function editProfileContentDelete() {
    $('#nickname').val('');
    $('#image').val(`${profileImage}`);
    $('#githubUrl').val('');
    $('#portfolioUrl').val('');
    $('#introduction').val('');
}

// 회원 탈퇴
function withdrawal() {
    if (confirm('정말 탈퇴하시겠습니까?')) {
        let token = Cookies.get('token');
        $.ajax({
            type: 'DELETE',
            url: process.env.BACKEND_HOST + '/user',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                console.log(response);
                Cookies.remove('token');
                localStorage.clear();
                alert('회원탈퇴에 성공했습니다.');
                window.location.href = '/home';
            },
            error: function (response) {
                console.log(response);
            }
        });
    }
}

// 로그아웃
window.logout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
        alert('로그아웃 되었습니다.');
        Cookies.remove('token');
        localStorage.clear();
        window.location.href = '/home';
    }
};

//수정 버튼 눌렀을 때 Edit 전에 검사

let isNicknameChecked = false;

window.requestEdit = () => {
    let nickname = $('#nickname').val();
    let nicknameDB = $('#nickname').text();

    if (nickname == '') {
        $('#nickname').addClass('is-danger');
        $('#nickname').focus();
        $('#profile-modal-help').text('닉네임을 입력해 주세요.').removeClass('is-success').addClass('is-danger');

        return;
    }

    // 닉네임 중복확인 여부 확인
    if (nickname == nicknameDB) {
        $('#nickname').removeClass('is-danger');
        $('#profile-modal-help').text('');

        isNicknameChecked == true;
    }
    else if (isNicknameChecked == false) {
        $('#nickname').addClass('is-danger');
        $('#nickname').focus();
        $('#profile-modal-help').text('닉네임 중복확인을 해주세요.').removeClass('is-success').addClass('is-danger');
        return;
    }

    $('#nickname').removeClass('is-danger');
    $('#profile-modal-help').text('');

    editProfile(nickname);
};

//중복확인 버튼 눌렀을 때 작동
window.checkNicknameDupProfile = () => {
    let token = Cookies.get('token');
    let nickname = $('#nickname').val();
    let nicknameDB = $('#nickname').text();

    $('#nickname').on('change keyup paste', function () {
        let currentVal = $(this).val();
        if (currentVal != nickname) {
            $('#nickname').addClass('is-danger');
            $('#nickname').focus();
            $('#profile-modal-help').text('닉네임 중복확인을 해주세요.').removeClass('is-success').addClass('is-danger');
            isNicknameChecked = false;
        }
        else if (nickname == nicknameDB) {
            $('#nickname').removeClass('is-danger').addClass('is-safe');
            $('#profile-modal-help').text('사용 가능한 닉네임입니다.').removeClass('is-danger').addClass('is-success');
            isNicknameChecked = true;
        }
    });

    if (nickname == '') {
        $('#nickname').addClass('is-danger');
        $('#nickname').focus();
        $('#profile-modal-help').text('닉네임을 입력해 주세요.').removeClass('is-success').addClass('is-danger');
        return;
    }

    $.ajax({
        type: 'PUT',
        url: process.env.BACKEND_HOST + '/user/profile/check-nickname',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        data: JSON.stringify({
            nickname: nickname
        }),
        success: function (response) {
            if (response['dup']) {
                $('#nickname').addClass('is-danger');
                $('#nickname').focus();
                $('#profile-modal-help').text('중복된 닉네임이 존재합니다.').removeClass('is-success').addClass('is-danger');
                return;
            }
            $('#nickname').removeClass('is-danger').addClass('is-safe');
            $('#nickname').focus();
            $('#profile-modal-help').text('사용 가능한 닉네임입니다.').removeClass('is-danger').addClass('is-success');
            isNicknameChecked = true;
        }
    });
};

window.readMyPosts = () => {
    $('#readMyPosts').attr('class', 'is-active');
    $('#readMyComments').attr('class', '');
    $('#profile-section').empty();

    let token = Cookies.get('token');
    $.ajax({
        type: 'GET',
        url: process.env.BACKEND_HOST + '/user/profile/posts',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            let posts = response;

            for (let index = 0; index < posts.length; index++) {
                let id = posts[index]['id'];
                let title = posts[index]['title'];
                let meetingType = posts[index]['meetingType'];
                let period = posts[index]['period'];
                let hits = posts[index]['hits'];
                let recruitmentState = posts[index]['recruitmentState'] ? '모집 완료' : '모집 중';

                let recruitmentStateColor = posts[index]['recruitmentState'] ? 'is-default' : 'is-pink';
                let recruitmentStateColorBack = posts[index]['recruitmentState'] ? 'is-white' : 'is-gray';

                let tempHTML = `<div id=${id} class="card ${recruitmentStateColorBack}">
                                    <div class="card-header">
                                        <p class="card-header-title" onclick="openPost(${id})" >${title}</p>
                                    </div>

                                    <div class="card-content" onclick="openPost(${id})">
                                        <div class="card-content-box">
                                            <div class="content">
                                                <span>기간</span>
                                                <span class="bubble-item bubble">${period}</span>
                                            </div>

                                            <div class="content">
                                                <span>모임 방식</span>
                                                <span class="bubble-item bubble">${meetingType}</span>
                                            </div>

                                            <div class="content">
                                            <span>모집 현황</span>
                                            <span id="recruitmentState" class="bubble-item ${recruitmentStateColor}">${recruitmentState}</span>
                                        </div>

                                        </div>
                                        <div class="card-content-box">
                                        <div>
                                            <div class="content">
                                                <i class="fa-regular fa-eye"></i>
                                                <span>${hits}</span>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>`;

                $('#profile-section').append(tempHTML);
            }
        }
    });
};

window.readMyComments = () => {
    $('#readMyComments').attr('class', 'is-active');
    $('#readMyPosts').attr('class', '');
    $('#profile-section').empty();

    let token = Cookies.get('token');

    $.ajax({
        type: 'GET',
        url: process.env.BACKEND_HOST + '/user/profile/comments/',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        date: {},
        success: function (response) {
            console.log(response);
            for (let i = 0; i < response.length; i++) {
                let id = response[i]['id'];
                let postId = response[i]['postId'];
                let comment = response[i]['comments'];
                //서버에서 서비스에서 comments로 리턴해주도록 해놨음!
                let timeComment = new Date(response[i]['createDate'] + '+0000');
                let nickname = response[i]['nickname'];
                let timeBefore = time2str(timeComment);

                let tempHtml = `<article class="media" id="${id}" onclick='openPost(${postId})'>
                                    <div class="media-content">
                                        <div class="content">
                                            <p>
                                                <span style="font-weight: normal">@${nickname}</span>
                                                <small>· ${timeBefore}</small>
                                                <br>
                                                ${comment}
                                                <a id="deleteComment${i}" class="button has-text-centered is-rounded is-small")" onclick="deleteComment(${id}, ${false})">삭제</a>
                                            </p>
                                        </div>
                                    </div>
                                </article>`;
                $('#profile-section').append(tempHtml);
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
};

function time2str(date) {
    let today = new Date();
    let time = (today - date) / 1000 / 60;
    console.log(today, date);
    if (time < 1) {
        return '방금전';
    }
    if (time < 60) {
        return parseInt(time) + '분 전';
    }
    time = time / 60;
    if (time < 24) {
        return parseInt(time) + '시간 전';
    }
    time = time / 24;
    if (time < 7) {
        return parseInt(time) + '일 전';
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}