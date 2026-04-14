const SHEET_NAME = 'Proposal Requests';
const NOTIFY_EMAIL = 'contact@tkdglabs.com';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getOrCreateSheet_();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '접수시각(KST)',
        '접수시각(ISO)',
        '의뢰주체',
        '필요지원',
        '예산',
        '기간',
        '지역',
        '특별요청',
        '담당자명',
        '소속직함',
        '연락처',
        '이메일',
        '유입URL'
      ]);
    }

    sheet.appendRow([
      payload.submittedAtKst || '',
      payload.submittedAtIso || '',
      payload.clientType || '',
      Array.isArray(payload.serviceNeeds) ? payload.serviceNeeds.join(', ') : '',
      payload.budget || '',
      payload.timeline || '',
      payload.region || '',
      payload.specialRequest || '',
      payload.contactName || '',
      payload.contactOrg || '',
      payload.contactPhone || '',
      payload.contactEmail || '',
      payload.source || ''
    ]);

    const subject = '[제안 요청] ' + (payload.clientType || '신규 문의') + ' · ' + (payload.contactName || '담당자');
    const body = [
      '[TKDG Labs 제안 요청]',
      '',
      '의뢰 주체: ' + (payload.clientType || '-'),
      '필요 지원: ' + (Array.isArray(payload.serviceNeeds) ? payload.serviceNeeds.join(', ') : '-'),
      '예산 범위: ' + (payload.budget || '-'),
      '희망 기간: ' + (payload.timeline || '-'),
      '지역: ' + (payload.region || '-'),
      '특별 요청 사항: ' + (payload.specialRequest || '없음'),
      '',
      '담당자 성명: ' + (payload.contactName || '-'),
      '소속·직함: ' + (payload.contactOrg || '-'),
      '연락처: ' + (payload.contactPhone || '-'),
      '이메일: ' + (payload.contactEmail || '-'),
      '접수 시각(KST): ' + (payload.submittedAtKst || '-'),
      '유입 URL: ' + (payload.source || '-')
    ].join('\n');

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: body
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  return sheet;
}
