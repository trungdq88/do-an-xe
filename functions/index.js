'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var morgan = require('morgan');
var fetch = require('node-fetch');
var app = require('express')();
var FormData = require('form-data');

var bodyParser = require('body-parser');

app.use(morgan('combined'));
if (process.argv[2] === 'dev') {
  app.use(bodyParser.urlencoded({ extended: false }));
}

var SLACK_TOKEN = 'ZmAUnPLxNnfSdH0OlSp6wFnr';
var AIRTABLE_API_KEY = 'keyr23yt6W4vwV4zc';
var SLACK_INCOMING_HOOK =
'https://hooks.slack.com/services/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';
var SLACK_APP_TOKEN =
'xoxp-2171822291-11431073668-260975407857-c8d63e4f45eb3787f574d1cdc891d905';

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
                      text: '*' + fields['Tên món'] + ' (Mã số `' + fields['ID'] + '`)*',
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
                        text: 'Đặt món',
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
                    '*Đặt giùm* hoặc *đặt nhiều phần*, mọi người vào link này ' +
                    'nha: http://bit.ly/air-lounge-order-form :grin:' }]) }) }));case 2:return _context.abrupt('return',




            'Đã đăng menu lên channel :)');case 3:case 'end':return _context.stop();}}}, _callee, undefined);}));return function postToSlack(_x) {return _ref.apply(this, arguments);};}();


var checkMenu = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var todayFood;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
              fetch(
              'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Menu?' + (
              'api_key=' + AIRTABLE_API_KEY + '&filterByFormula={Món hôm nay}')).
              then(function (r) {return r.json();}));case 2:todayFood = _context2.sent;_context2.next = 5;return (

              postToSlack(todayFood.records));case 5:return _context2.abrupt('return', _context2.sent);case 6:case 'end':return _context2.stop();}}}, _callee2, undefined);}));return function checkMenu() {return _ref4.apply(this, arguments);};}();


var selectUserFullName = function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(params, listStaff) {var action, foodCount, form, response;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
            action = params.actions.length ? params.actions[0] : null;
            foodCount = action.selected_options[0].value;
            // Open dialog
            form = new FormData();
            form.append('token', SLACK_APP_TOKEN);
            form.append(
            'dialog',
            JSON.stringify({
              callback_id: 'set_up_username',
              title: 'Đặt món lần đầu',
              elements: [
              {
                label: 'Chọn tên của bạn',
                placeholder: '(Chỉ cần cài đặt trong lần đặt món đầu tiên)',
                type: 'select',
                name: 'airtable_staff_id',
                value: '',
                options: listStaff.records.map(function (staff) {return {
                    label: staff.fields['Họ tên'],
                    value: staff.id };}) },


              {
                label: 'Số lượng',
                type: 'text',
                name: 'food_count',
                value: foodCount }] }));




            form.append('trigger_id', params.trigger_id);_context3.next = 8;return (
              fetch('https://slack.com/api/dialog.open', {
                method: 'post',
                body: form }).
              then(function (r) {return r.json();}));case 8:response = _context3.sent;
            console.log('Send dialog:', response);return _context3.abrupt('return',
            '');case 11:case 'end':return _context3.stop();}}}, _callee3, undefined);}));return function selectUserFullName(_x2, _x3) {return _ref5.apply(this, arguments);};}();


var createOrder = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(airTableStaffId, foodCount) {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
            console.log('createOrder', airTableStaffId, foodCount);return _context4.abrupt('return',
            '');case 2:case 'end':return _context4.stop();}}}, _callee4, undefined);}));return function createOrder(_x4, _x5) {return _ref6.apply(this, arguments);};}();


var setUpUsernameAndOrder = function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(params) {var airtableResponse;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:if (
            params.submission.airtable_staff_id) {_context5.next = 2;break;}return _context5.abrupt('return',
            {
              errors: [
              {
                name: 'airtable_staff_id',
                error: 'Bạn cần phải chọn tên để đặt món!' }] });case 2:_context5.next = 4;return (





              fetch(
              'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Staff/' + (
              '' + params.submission.airtable_staff_id),
              {
                method: 'patch',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: 'Bearer ' + AIRTABLE_API_KEY },


                body: JSON.stringify({
                  fields: {
                    'Slack User ID': params.user.id } }) }).



              then(function (r) {return r.json();}));case 4:airtableResponse = _context5.sent;_context5.next = 7;return (

              createOrder(
              params.submission.airtable_staff_id,
              params.submission.food_count));case 7:return _context5.abrupt('return', _context5.sent);case 8:case 'end':return _context5.stop();}}}, _callee5, undefined);}));return function setUpUsernameAndOrder(_x6) {return _ref7.apply(this, arguments);};}();



var orderFood = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(params) {var user, action, foodCount, listStaff, airTableUser;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:
            user = params.user;
            action = params.actions.length ? params.actions[0] : null;
            foodCount = action.selected_options[0].value;

            console.log('action', action);_context6.next = 6;return (

              fetch(
              'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Staff' + (
              '?api_key=' + AIRTABLE_API_KEY)).
              then(function (r) {return r.json();}));case 6:listStaff = _context6.sent;

            airTableUser = listStaff.records.filter(
            function (staff) {return staff.fields['Slack User ID'] === user.id;})[
            0];if (

            airTableUser) {_context6.next = 10;break;}return _context6.abrupt('return',
            selectUserFullName(params, listStaff));case 10:


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
            console.log('Done');_context6.next = 13;return (

              createOrder(airTableUser.id, foodCount));case 13:return _context6.abrupt('return', _context6.sent);case 14:case 'end':return _context6.stop();}}}, _callee6, undefined);}));return function orderFood(_x7) {return _ref8.apply(this, arguments);};}();


app.get('/', function (req, res) {
  res.send('Go home, you are drunk');
});

app.post('/test-post-to-slack', function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(req, res) {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.t0 =
            res;_context7.next = 3;return checkMenu();case 3:_context7.t1 = _context7.sent;_context7.t0.send.call(_context7.t0, _context7.t1);case 5:case 'end':return _context7.stop();}}}, _callee7, undefined);}));return function (_x8, _x9) {return _ref9.apply(this, arguments);};}());


app.post('/order', function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(req, res) {var params;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:
            params = JSON.parse(req.body.payload);if (!(

            !params.token || params.token !== SLACK_TOKEN)) {_context8.next = 4;break;}
            res.send('No.');return _context8.abrupt('return');case 4:



            console.log('callback_id', params.callback_id);if (!(
            params.callback_id.indexOf('order_food_') === 0)) {_context8.next = 13;break;}_context8.t0 =
            res;_context8.next = 9;return orderFood(params);case 9:_context8.t1 = _context8.sent;_context8.t0.send.call(_context8.t0, _context8.t1);_context8.next = 19;break;case 13:if (!(
            params.callback_id === 'set_up_username')) {_context8.next = 19;break;}_context8.t2 =
            res;_context8.next = 17;return setUpUsernameAndOrder(params);case 17:_context8.t3 = _context8.sent;_context8.t2.send.call(_context8.t2, _context8.t3);case 19:case 'end':return _context8.stop();}}}, _callee8, undefined);}));return function (_x10, _x11) {return _ref10.apply(this, arguments);};}());



app.post('/list', function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(req, res) {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:if (!(
            !req.body.token || req.body.token !== SLACK_TOKEN)) {_context9.next = 3;break;}
            res.send('No.');return _context9.abrupt('return');case 3:_context9.t0 =


            res;_context9.next = 6;return checkMenu();case 6:_context9.t1 = _context9.sent;_context9.t0.send.call(_context9.t0, _context9.t1);case 8:case 'end':return _context9.stop();}}}, _callee9, undefined);}));return function (_x12, _x13) {return _ref11.apply(this, arguments);};}());


app.get('/hello', function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(req, res) {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:
            res.send('hello from expressjs.');case 1:case 'end':return _context10.stop();}}}, _callee10, undefined);}));return function (_x14, _x15) {return _ref12.apply(this, arguments);};}());


if (process.argv[2] === 'dev') {
  app.listen(8010, function () {
    console.log('Example app listening on port 8010.');
  });
}
exports.doanxe = app;