'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var morgan = require('morgan');
var fetch = require('node-fetch');
var app = require('express')();

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
'xoxp-2171822291-11431073668-253307635457-638389f99372c7659cc7d329223e2cb0';

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


var orderFood = function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(params) {var user, action, listStaff, airTableUser;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
            user = params.user;
            action = params.actions.length ? params.actions[0] : null;_context3.next = 4;return (

              fetch(
              'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Staff' + (
              '?api_key=' + AIRTABLE_API_KEY)).
              then(function (r) {return r.json();}));case 4:listStaff = _context3.sent;

            airTableUser = listStaff.records.filter(
            function (staff) {return staff.fields['Slack User ID'] === user.id;})[
            0];if (

            airTableUser) {_context3.next = 8;break;}return _context3.abrupt('return',
            'selectUserFullName(params, res, listStaff)');case 8:


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
            console.log('Done');return _context3.abrupt('return',

            '');case 10:case 'end':return _context3.stop();}}}, _callee3, undefined);}));return function orderFood(_x2) {return _ref5.apply(this, arguments);};}();


app.get('/', function (req, res) {
  res.send('Go home, you are drunk');
});

app.post('/test-post-to-slack', function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 =
            res;_context4.next = 3;return checkMenu();case 3:_context4.t1 = _context4.sent;_context4.t0.send.call(_context4.t0, _context4.t1);case 5:case 'end':return _context4.stop();}}}, _callee4, undefined);}));return function (_x3, _x4) {return _ref6.apply(this, arguments);};}());


app.post('/order', function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(req, res) {var params;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:
            params = JSON.parse(req.body.payload);if (!(

            !params.token || params.token !== SLACK_TOKEN)) {_context5.next = 4;break;}
            res.send('No.');return _context5.abrupt('return');case 4:if (!(



            params.callback_id.indexOf('order_food_') === 0)) {_context5.next = 12;break;}_context5.t0 =
            res;_context5.next = 8;return orderFood(params);case 8:_context5.t1 = _context5.sent;_context5.t0.send.call(_context5.t0, _context5.t1);_context5.next = 18;break;case 12:if (!(
            params.callback_id === 'set_up_username')) {_context5.next = 18;break;}_context5.t2 =
            res;_context5.next = 16;return setUpUsername(params, res);case 16:_context5.t3 = _context5.sent;_context5.t2.send.call(_context5.t2, _context5.t3);case 18:case 'end':return _context5.stop();}}}, _callee5, undefined);}));return function (_x5, _x6) {return _ref7.apply(this, arguments);};}());



app.post('/list', function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(req, res) {return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:if (!(
            !req.body.token || req.body.token !== SLACK_TOKEN)) {_context6.next = 3;break;}
            res.send('No.');return _context6.abrupt('return');case 3:_context6.t0 =


            res;_context6.next = 6;return checkMenu();case 6:_context6.t1 = _context6.sent;_context6.t0.send.call(_context6.t0, _context6.t1);case 8:case 'end':return _context6.stop();}}}, _callee6, undefined);}));return function (_x7, _x8) {return _ref8.apply(this, arguments);};}());


app.get('/hello', function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(req, res) {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:
            res.send('hello from expressjs.');case 1:case 'end':return _context7.stop();}}}, _callee7, undefined);}));return function (_x9, _x10) {return _ref9.apply(this, arguments);};}());


if (process.argv[2] === 'dev') {
  app.listen(8010, function () {
    console.log('Example app listening on port 8010.');
  });
}
exports.doanxe = app;