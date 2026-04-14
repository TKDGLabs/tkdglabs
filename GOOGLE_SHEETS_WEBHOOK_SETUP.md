# 제안 요청 폼 연동 설정 (Google Sheets + 메일 알림)

현재 사이트는 웹훅 URL이 설정되면:
- 제안 요청 폼 데이터가 Google Sheets에 자동 저장되고
- `contact@tkdglabs.com`으로 알림 메일이 자동 발송됩니다.

웹훅 미설정 시에는 자동으로 `mailto` 방식(메일 작성창)으로 동작합니다.

---

## 1) 구글 시트 만들기
1. Google Sheets에서 새 문서를 만듭니다.
2. 문서명 예시: `TKDG Proposal Intake`.
3. 시트 탭 이름은 아무거나 두셔도 됩니다. (스크립트가 `Proposal Requests` 탭을 자동 생성)

## 2) Apps Script 붙여넣기
1. 시트 상단 메뉴 `확장 프로그램 > Apps Script` 이동
2. 기본 코드 삭제 후 아래 파일 내용을 붙여넣기:
   - `/apps-script/proposal_webhook.gs`
3. 저장

## 3) 웹 앱으로 배포
1. Apps Script 우측 상단 `배포 > 새 배포`
2. 유형: `웹 앱`
3. 실행 주체: `나`
4. 액세스 권한: `모든 사용자`
5. 배포 후 발급되는 **웹 앱 URL** 복사

## 4) 사이트에 웹훅 URL 연결
`index.html`의 아래 메타 태그 `content`에 웹 앱 URL 입력:

```html
<meta name="proposal-webhook-url" content="여기에_웹앱_URL" />
```

위치: `/index.html` `<head>` 내부

## 5) 배포 후 테스트
1. 사이트에서 `제안 요청하기` 폼 작성 후 제출
2. 확인 포인트:
   - Google Sheets의 `Proposal Requests` 시트에 행 추가
   - `contact@tkdglabs.com`으로 알림 메일 수신

---

## 운영 팁
- Apps Script 코드를 수정하면 `배포 > 관리 > 새 버전 배포`를 다시 해야 반영됩니다.
- 메일 알림 수신 주소를 바꾸려면 `proposal_webhook.gs`의 `NOTIFY_EMAIL` 값 수정 후 재배포하세요.
- 스팸이 많아지면 접근권한을 조정하거나, 폼에 reCAPTCHA/서버 검증을 추가하는 것을 권장합니다.
