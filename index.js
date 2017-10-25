'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var morgan = require('morgan');
var fetch = require('node-fetch');
var app = require('express')();
var FormData = require('form-data');
var Airtable = require('airtable');

var bodyParser = require('body-parser');

var isDevelopment = process.argv[2] === 'dev';

app.use(morgan('combined'));
if (isDevelopment) {
  app.use(bodyParser.urlencoded({ extended: false }));
}

var SLACK_TOKEN = 'ZmAUnPLxNnfSdH0OlSp6wFnr';
var AIRTABLE_API_KEY = 'keyr23yt6W4vwV4zc';
var SLACK_INCOMING_HOOK =
'https://hooks.slack.com/services/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';
var SLACK_APP_TOKEN = 'xoxb-254761642838-Ta2VbGf2N3vUvGYNl4salNEy';

var airTableApi = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
'appkhdzUXxa4FWcih');


var postToSlack = function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(foods) {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
              fetch(SLACK_INCOMING_HOOK, {
                method: 'POST',
                body: JSON.stringify({
                  text:
                  '<!channel> Hi mọi người, thức ăn xế hôm nay có những món sau đây. ' +
                  'Mọi người nhanh tay submit đặt món nhé. :alarm_clock: Em chốt order ' +
                  'lúc *11:20am* hen! Sau giờ này, đường link sẽ bị disabled, các bạn ' +
                  'sẽ không đặt thêm được nữa nên mọi người tranh thủ nha :smile: ' +
                  'Thanks.',
                  attachments: foods.
                  map(function (_ref2) {var fields = _ref2.fields,id = _ref2.id;return {
                      parse: 'full',
                      text: fields['Tên món'] + ' (Mã số ' + fields['ID'] + ')',
                      fallback: 'Bạn không thể đặt món',
                      callback_id: 'order_food_' + id,
                      attachment_type: 'default',
                      image_url: fields['Hình ảnh'] ?
                      (fields['Hình ảnh'].filter(
                      function (_ref3) {var type = _ref3.type;return type === 'image/jpeg';})[
                      0] || {}).url || '' :
                      '',
                      actions: [
                      {
                        name: 'order_food_' + id,
                        text: 'Đặt ' + fields['Tên món'],
                        type: 'select',
                        options: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20].
                        map(function (i) {return {
                            text: 'Đặt ' + i + ' phần',
                            value: i };}) }] };}).




                  concat([
                  {
                    text:
                    'Chọn số phần bên trên để đặt cho mình. Để đặt giùm người khác,' +
                    ' mọi người vào link này nha:' +
                    ' http://bit.ly/air-lounge-order-form :grin:' }]) }) }));case 2:return _context.abrupt('return',




            'Đã đăng menu lên channel :)');case 3:case 'end':return _context.stop();}}}, _callee, undefined);}));return function postToSlack(_x) {return _ref.apply(this, arguments);};}();


var checkMenu = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(params) {var findUser, todayFood;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
            console.log('checkmenu', params);_context2.next = 3;return (

              new Promise(function (resolve, reject) {return (
                  airTableApi('Staff').
                  select({
                    filterByFormula: '{Slack User ID}=\'' + params.user_id + '\'' }).

                  firstPage(function (err, records) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve(records);
                  }));}));case 3:findUser = _context2.sent;if (!(


            !findUser.length || findUser[0].fields.Admin !== true)) {_context2.next = 6;break;}return _context2.abrupt('return',
            'Chỉ có admin dễ thương mới được xài lệnh này :)');case 6:


            console.log('List menu by', findUser[0]);_context2.next = 9;return (

              new Promise(function (resolve, reject) {return (
                  airTableApi('Menu').
                  select({
                    filterByFormula: '{Món hôm nay}' }).

                  firstPage(function (err, records) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve(records);
                  }));}));case 9:todayFood = _context2.sent;_context2.next = 12;return (


              postToSlack(todayFood));case 12:return _context2.abrupt('return', _context2.sent);case 13:case 'end':return _context2.stop();}}}, _callee2, undefined);}));return function checkMenu(_x2) {return _ref4.apply(this, arguments);};}();


var selectUserFullName = function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(params, listStaff) {var action, foodCount, foodId, form, response;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
            action = params.actions.length ? params.actions[0] : null;
            foodCount = action.selected_options[0].value;
            foodId = params.callback_id.replace(/order_food_/, '');
            // Open dialog
            form = new FormData();
            form.append('token', SLACK_APP_TOKEN);
            form.append(
            'dialog',
            JSON.stringify({
              callback_id: 'set_up_username_' + foodId,
              title: 'Đặt món lần đầu',
              elements: [
              {
                label: 'Chọn tên của bạn',
                placeholder: '(Chỉ cần cài đặt trong lần đặt món đầu tiên)',
                type: 'select',
                name: 'airtable_staff_id',
                value: '',
                options: listStaff.map(function (staff) {return {
                    label: staff.fields['Họ tên'],
                    value: staff.id };}) },


              {
                label: 'Số lượng',
                type: 'text',
                name: 'food_count',
                value: foodCount }] }));




            form.append('trigger_id', params.trigger_id);_context3.next = 9;return (
              fetch('https://slack.com/api/dialog.open', {
                method: 'post',
                body: form }).
              then(function (r) {return r.json();}));case 9:response = _context3.sent;
            console.log('Send dialog:', response);return _context3.abrupt('return',
            '');case 12:case 'end':return _context3.stop();}}}, _callee3, undefined);}));return function selectUserFullName(_x3, _x4) {return _ref5.apply(this, arguments);};}();


var sendMessageToUser = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(slackUserId, channelId, msg) {var form;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
            form = new FormData();
            form.append('token', SLACK_APP_TOKEN);
            form.append('channel', channelId);
            form.append('text', msg);
            form.append('user', slackUserId);_context4.next = 7;return (
              fetch('https://slack.com/api/chat.postEphemeral', {
                method: 'post',
                body: form }).
              then(function (r) {return r.json();}));case 7:return _context4.abrupt('return', _context4.sent);case 8:case 'end':return _context4.stop();}}}, _callee4, undefined);}));return function sendMessageToUser(_x5, _x6, _x7) {return _ref6.apply(this, arguments);};}();


var createOrder = function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(
  channelId,
  slackUserId,
  airTableStaffId,
  foodCount,
  foodId,
  remaining) {var remainingAfterUse, msg, createOrderResponse, response;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:

            console.log('createOrder', {
              channelId: channelId,
              slackUserId: slackUserId,
              airTableStaffId: airTableStaffId,
              foodCount: foodCount,
              foodId: foodId,
              remaining: remaining });

            remainingAfterUse =
            (remaining === undefined ? 20 : remaining) - Number(foodCount);

            msg =
            ':white_check_mark: B\u1EA1n \u0111\xE3 \u0111\u1EB7t th\xE0nh c\xF4ng `' + foodCount + '` m\xF3n!' + (
            remainingAfterUse <= 0 ? ' B\u1EA1n \u0111\xE3 h\u1EBFt coupon th\xE1ng n\xE0y :wave:' : ' Th\xE1ng n\xE0y b\u1EA1n c\xF2n `' +

            remainingAfterUse + '` coupon. :hugging_face:');_context5.prev = 3;_context5.next = 6;return (


              new Promise(function (resolve, reject) {return (
                  airTableApi('Order').create(
                  {
                    'Tên nhân viên': [airTableStaffId],
                    'Món ăn ID': [foodId],
                    'Số phần ăn': Number(foodCount) },

                  function (err, record) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve(record);
                  }));}));case 6:createOrderResponse = _context5.sent;


            console.log('createOrderResponse', createOrderResponse);_context5.next = 13;break;case 10:_context5.prev = 10;_context5.t0 = _context5['catch'](3);

            msg = ':x: C\xF3 l\u1ED7i x\u1EA3y ra, vui l\xF2ng th\u1EED l\u1EA1i. (' + _context5.t0 + ')';case 13:_context5.next = 15;return (


              sendMessageToUser(slackUserId, channelId, msg));case 15:response = _context5.sent;

            console.log('Send success msg: ', response);return _context5.abrupt('return',

            '');case 18:case 'end':return _context5.stop();}}}, _callee5, undefined, [[3, 10]]);}));return function createOrder(_x8, _x9, _x10, _x11, _x12, _x13) {return _ref7.apply(this, arguments);};}();


var setUpUsernameAndOrder = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(params) {var foodId, airtableResponse;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:
            foodId = params.callback_id.replace(/set_up_username_/, '');if (

            params.submission.airtable_staff_id) {_context6.next = 3;break;}return _context6.abrupt('return',
            {
              errors: [
              {
                name: 'airtable_staff_id',
                error: 'Bạn cần phải chọn tên để đặt món!' }] });case 3:_context6.next = 5;return (





              new Promise(function (resolve, reject) {return (
                  airTableApi('Staff').update(
                  params.submission.airtable_staff_id,
                  {
                    'Slack User ID': params.user.id },

                  function (err, record) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve(record);
                  }));}));case 5:airtableResponse = _context6.sent;



            console.log('params', params);
            // Ignore the check remaining coupon step
            _context6.next = 9;return createOrder(
            params.channel.id,
            params.user.id,
            params.submission.airtable_staff_id,
            params.submission.food_count,
            foodId);case 9:return _context6.abrupt('return', _context6.sent);case 10:case 'end':return _context6.stop();}}}, _callee6, undefined);}));return function setUpUsernameAndOrder(_x14) {return _ref8.apply(this, arguments);};}();



var orderFood = function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(params) {var user, action, foodCount, foodId, listStaff, airTableUser, remaining;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:
            user = params.user;
            action = params.actions.length ? params.actions[0] : null;
            foodCount = action.selected_options[0].value;
            foodId = params.callback_id.replace(/order_food_/, '');

            console.log('action', action);

            /* const listStaff = await fetch( */
            /*   'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Staff' + */
            /*     ('?api_key=' + AIRTABLE_API_KEY), */
            /* ).then(r => r.json()); */

            // We have to get ALL staff, because if current user is not mapped, we need
            // the list to display to user and ask them to choose
            _context7.next = 7;return new Promise(function (resolve, reject) {return (
                airTableApi('Staff').select().firstPage(function (err, records) {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve(records);
                }));});case 7:listStaff = _context7.sent;


            console.log('listStaff length', listStaff.length);

            airTableUser = listStaff.filter(
            function (staff) {return staff.fields['Slack User ID'] === user.id;})[
            0];

            console.log('order by', airTableUser);if (

            airTableUser) {_context7.next = 13;break;}return _context7.abrupt('return',
            selectUserFullName(params, listStaff));case 13:


            remaining = Number(airTableUser.fields['Số coupon còn lại*']);if (!(
            remaining <= 0)) {_context7.next = 20;break;}_context7.next = 17;return (
              sendMessageToUser(
              user.id,
              params.channel.id,
              ':x: Rất tiếc bạn đã xài hết coupon tháng này. :pensive:'));case 17:return _context7.abrupt('return',

            '');case 20:if (!(
            remaining < foodCount)) {_context7.next = 24;break;}_context7.next = 23;return (
              sendMessageToUser(
              user.id,
              params.channel.id, ':x: Th\xE1ng n\xE0y b\u1EA1n ch\u1EC9 c\xF2n `' +
              remaining + '` coupon, kh\xF4ng \u0111\u1EE7 \u0111\u1EC3 \u0111\u1EB7t `' + foodCount + '` ph\u1EA7n :scream:'));case 23:return _context7.abrupt('return',

            '');case 24:


            /* const orderList = await fetch( */
            /*   'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Order?' + */
            /*     ('api_key=' + AIRTABLE_API_KEY + '&') + */
            /*     "filterByFormula=IS_SAME(CREATED_TIME(), TODAY(), 'day')", */
            /* ).then(r => r.json()); */
            /*  */
            /* console.log( */
            /*   'orderList', */
            /*   orderList.records.map(order => ({ */
            /*     staffId: order.fields['Tên nhân viên'], */
            /*     count: order.fields['Số phần ăn'], */
            /*   })), */
            /* ); */

            console.log('params', params);_context7.next = 27;return (
              createOrder(
              params.channel.id,
              user.id,
              airTableUser.id,
              foodCount,
              foodId,
              remaining));case 27:return _context7.abrupt('return', _context7.sent);case 28:case 'end':return _context7.stop();}}}, _callee7, undefined);}));return function orderFood(_x15) {return _ref9.apply(this, arguments);};}();



app.get('/', function (req, res) {
  res.send('Go home, you are drunk');
});

app.post('/test-post-to-slack', function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(req, res) {return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.t0 =
            res;_context8.next = 3;return checkMenu();case 3:_context8.t1 = _context8.sent;_context8.t0.send.call(_context8.t0, _context8.t1);case 5:case 'end':return _context8.stop();}}}, _callee8, undefined);}));return function (_x16, _x17) {return _ref10.apply(this, arguments);};}());


app.post('/order', function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(req, res) {var params;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:
            params = JSON.parse(req.body.payload);if (!(

            !params.token || params.token !== SLACK_TOKEN)) {_context9.next = 4;break;}
            res.send('No.');return _context9.abrupt('return');case 4:



            console.log('callback_id', params.callback_id);if (!(
            params.callback_id.indexOf('order_food_') === 0)) {_context9.next = 13;break;}_context9.t0 =
            res;_context9.next = 9;return orderFood(params);case 9:_context9.t1 = _context9.sent;_context9.t0.send.call(_context9.t0, _context9.t1);_context9.next = 19;break;case 13:if (!(
            params.callback_id.indexOf('set_up_username_') === 0)) {_context9.next = 19;break;}_context9.t2 =
            res;_context9.next = 17;return setUpUsernameAndOrder(params);case 17:_context9.t3 = _context9.sent;_context9.t2.send.call(_context9.t2, _context9.t3);case 19:case 'end':return _context9.stop();}}}, _callee9, undefined);}));return function (_x18, _x19) {return _ref11.apply(this, arguments);};}());



app.post('/list', function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(req, res) {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:if (!(
            !req.body.token || req.body.token !== SLACK_TOKEN)) {_context10.next = 3;break;}
            res.send('No.');return _context10.abrupt('return');case 3:_context10.t0 =


            res;_context10.next = 6;return checkMenu(req.body);case 6:_context10.t1 = _context10.sent;_context10.t0.send.call(_context10.t0, _context10.t1);case 8:case 'end':return _context10.stop();}}}, _callee10, undefined);}));return function (_x20, _x21) {return _ref12.apply(this, arguments);};}());


app.get('/hello', function () {var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(req, res) {return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:
            res.send('hello from expressjs.');case 1:case 'end':return _context11.stop();}}}, _callee11, undefined);}));return function (_x22, _x23) {return _ref13.apply(this, arguments);};}());


if (isDevelopment) {
  app.listen(8010, function () {
    console.log('Example app listening on port 8010.');
  });
}
exports.doanxe = app;