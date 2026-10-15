<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="hasProfile" value="${not empty profile and (empty profileState or profileState eq 'ready')}" />
<!doctype html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="<c:url value='/assets/brand/favicon.ico'/>" type="image/x-icon">
    <link rel="icon" href="<c:url value='/assets/brand/favicon.svg'/>" type="image/svg+xml" sizes="any">
    <link rel="apple-touch-icon" href="<c:url value='/assets/brand/apple-touch-icon.png'/>" sizes="180x180">
    <title>Hồ sơ cá nhân · Edu Connect</title>
    <link rel="stylesheet" href="<c:url value='/css/tokens.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/reset.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/base.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/utilities.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/layouts.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/components/form/input.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/components/feedback/alert.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/components/layout/user-header.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/components/layout/account-footer.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/components/layout/page-header.css'/>">
    <link rel="stylesheet" href="<c:url value='/css/pages/account/profile.css'/>">
</head>
<body class="profile-page">
    <%-- Proposed shared fragment paths; Đại confirms them in registry v1. --%>
    <jsp:include page="/WEB-INF/views/fragments/layout/user-header.jsp" />
    <main class="user-shell__main profile-page__main">
        <div class="user-shell__content profile-page__content">
            <header class="page-header account-page-heading">
                <div class="page-header__title-block"><h1 class="page-header__title">Hồ sơ cá nhân</h1></div>
            </header>
            <p class="profile-page-note" role="note">Chức năng lưu hồ sơ đang chờ tích hợp. Thay đổi hiện chỉ áp dụng trên giao diện.</p>
            <noscript><p class="profile-page-note">Vui lòng bật JavaScript để dùng thao tác chỉnh sửa và hủy.</p></noscript>
            <div class="profile-page__layout">
                <aside class="profile-nav" aria-label="Điều hướng tài khoản">
                    <a class="profile-nav__item is-active" href="#ho-so" aria-current="page">Hồ sơ cá nhân</a>
                </aside>
                <section class="profile-card" id="ho-so" aria-labelledby="profile-card-title">
                    <div class="profile-card__top">
                        <div><h2 id="profile-card-title">Thông tin cơ bản</h2></div>
                        <c:if test="${hasProfile}">
                            <div class="profile-card__actions">
                                <button class="profile-action profile-action--secondary" type="button" data-profile-edit disabled>Chỉnh sửa</button>
                                <button class="profile-action profile-action--secondary" type="button" data-profile-cancel hidden>Hủy</button>
                                <button class="profile-action profile-action--primary" type="submit" form="account-profile-form" data-profile-save hidden>Lưu thay đổi</button>
                            </div>
                        </c:if>
                    </div>
                    <c:choose>
                        <c:when test="${hasProfile}">
                            <section class="alert alert--success profile-status" role="status" aria-live="polite" hidden>
                                <span class="alert__icon" aria-hidden="true"></span>
                                <div class="alert__content"><p class="alert__message" data-profile-status></p></div>
                            </section>
                            <div class="profile-card__identity">
                                <span class="profile-avatar" aria-hidden="true" data-profile-avatar><c:out value="${profileInitials}" default="?" /></span>
                                <div>
                                    <strong data-profile-display-name><c:out value="${profile.name}" /></strong>
                                    <span data-profile-display-role><c:out value="${profileRoleLabel}" default="Người dùng" /></span>
                                </div>
                            </div>
                            <%-- No mutation endpoint until the A02 form contract is handed over. JS prevents submission. --%>
                            <form class="profile-form" id="account-profile-form" action="<c:url value='/account/profile'/>" method="get" novalidate data-profile-form>
                                <div class="profile-form__field">
                                    <label for="profile-name">Họ và tên</label>
                                    <div class="profile-value" data-profile-display="name"><c:out value="${profile.name}" /></div>
                                    <div class="input-control" data-profile-control="name" hidden><input class="input-control__input" id="profile-name" name="name" type="text" autocomplete="name" value="<c:out value='${profile.name}'/>" aria-describedby="profile-name-error"></div>
                                    <p class="profile-form__error" id="profile-name-error" <c:if test="${empty formErrors.name}">hidden</c:if>><c:out value="${formErrors.name}" /></p>
                                </div>
                                <div class="profile-form__field">
                                    <label for="profile-email">Email</label>
                                    <div class="profile-value profile-value--locked" data-profile-display="email"><span data-profile-display-email><c:out value="${profile.email}" /></span><span>Email được dùng để đăng nhập.</span></div>
                                    <div class="input-control" data-profile-control="email" hidden><input class="input-control__input" id="profile-email" name="email" type="email" inputmode="email" autocomplete="email" value="<c:out value='${profile.email}'/>" aria-describedby="profile-email-error"></div>
                                    <p class="profile-form__error" id="profile-email-error" <c:if test="${empty formErrors.email}">hidden</c:if>><c:out value="${formErrors.email}" /></p>
                                </div>
                                <div class="profile-form__field">
                                    <label for="profile-phone">Số điện thoại</label>
                                    <div class="profile-value" data-profile-display="phone"><c:out value="${profile.phone}" /></div>
                                    <div class="input-control" data-profile-control="phone" hidden><input class="input-control__input" id="profile-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="<c:out value='${profile.phone}'/>" aria-describedby="profile-phone-error"></div>
                                    <p class="profile-form__error" id="profile-phone-error" <c:if test="${empty formErrors.phone}">hidden</c:if>><c:out value="${formErrors.phone}" /></p>
                                </div>
                                <div class="profile-form__field">
                                    <label for="profile-bio">Giới thiệu</label>
                                    <div class="profile-value ${empty profile.bio ? 'profile-value--empty' : ''}" data-profile-display="bio"><c:out value="${profile.bio}" default="" /><c:if test="${empty profile.bio}">Chưa có giới thiệu. Hãy thêm vài dòng để mọi người hiểu hơn về bạn.</c:if></div>
                                    <textarea class="profile-form__textarea" id="profile-bio" name="bio" maxlength="300" placeholder="Viết vài dòng giới thiệu về bạn..." aria-describedby="profile-bio-error profile-bio-count" hidden><c:out value="${profile.bio}" /></textarea>
                                    <p class="profile-form__error" id="profile-bio-error" <c:if test="${empty formErrors.bio}">hidden</c:if>><c:out value="${formErrors.bio}" /></p>
                                    <p class="profile-form__hint" id="profile-bio-count" data-profile-bio-count hidden>0/300</p>
                                </div>
                            </form>
                        </c:when>
                        <c:when test="${profileState eq 'loading'}"><p class="profile-state" role="status" aria-live="polite" aria-busy="true">Đang tải hồ sơ…</p></c:when>
                        <c:when test="${profileState eq 'error'}"><div class="alert alert--error" role="alert"><div class="alert__content"><p class="alert__message">Không thể tải hồ sơ. Vui lòng thử tải lại trang.</p></div></div></c:when>
                        <c:when test="${profileState eq 'empty'}"><p class="profile-state" role="status">Chưa có thông tin hồ sơ để hiển thị.</p></c:when>
                        <c:otherwise><p class="profile-state" role="status">Thông tin hồ sơ đang chờ tích hợp.</p></c:otherwise>
                    </c:choose>
                </section>
            </div>
        </div>
    </main>
    <jsp:include page="/WEB-INF/views/fragments/layout/account-footer.jsp" />
    <script src="<c:url value='/js/pages/account/profile.js'/>" defer></script>
</body>
</html>
