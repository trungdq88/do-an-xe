'use strict';var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var fetch = require('node-fetch');
var functions = require('firebase-functions');
var app = require('express')();

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
                    '*Đặt giùm* hoặc *đặt nhiều phần*, mọi người vào link này' +
                    'nha: http://bit.ly/air-lounge-order-form :grin:' }]) }) }));case 2:return _context.abrupt('return',




            'Đã đăng menu lên channel :)');case 3:case 'end':return _context.stop();}}}, _callee, undefined);}));return function postToSlack(_x) {return _ref.apply(this, arguments);};}();


var checkMenu = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var todayFood;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
              fetch(
              'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Menu?' + (
              'api_key=' + AIRTABLE_API_KEY + '&filterByFormula={Món hôm nay}')).
              then(function (r) {return r.json();}));case 2:todayFood = _context2.sent;_context2.next = 5;return (

              postToSlack(todayFood.records));case 5:return _context2.abrupt('return', _context2.sent);case 6:case 'end':return _context2.stop();}}}, _callee2, undefined);}));return function checkMenu() {return _ref4.apply(this, arguments);};}();


/* const orderFood = async () => { */
/*             user = params.user; */
/*             action = params.actions.length ? params.actions[0] : null; */
/*             console.log('params', params);_context3.next = 5;return ( */
/*  */
/*               fetch( */
/*               'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Staff' + ('?api_key=' + */
/*               AIRTABLE_API_KEY)). */
/*               then(function (r) {return r.json();}));case 5:listStaff = _context3.sent; */
/*  */
/*             airTableUser = listStaff.records.filter( */
/*             function (staff) {return staff.fields['Slack User ID'] === user.id;})[ */
/*             0];if ( */
/*             airTableUser) {_context3.next = 13;break;}_context3.next = 10;return ( */
/*               selectUserFullName(params, res, listStaff));case 10:return _context3.abrupt('return', _context3.sent);case 13:_context3.next = 15;return ( */
/*               fetch( */
/*               'https://api.airtable.com/v0/appkhdzUXxa4FWcih/Order?' + ('api_key=' + */
/*               AIRTABLE_API_KEY + '&') + 'filterByFormula=IS_SAME(CREATED_TIME(), TODAY(), \'day\')'). */
/*  */
/*               then(function (r) {return r.json();}));case 15:orderList = _context3.sent; */
/*  */
/*             console.log( */
/*             'orderList', */
/*             orderList.records.map(function (order) {return { */
/*                 staffId: order.fields['Tên nhân viên'], */
/*                 count: order.fields['Số phần ăn'] };})); */
/*  */
/*  */
/*  */
/*             return 'done'; */
/* }; */
/*  */

app.get('/', function (req, res) {
  res.send('Root page 123');
});

app.get('/test-post-to-slack', function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res) {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.t0 =
            res;_context3.next = 3;return checkMenu();case 3:_context3.t1 = _context3.sent;_context3.t0.send.call(_context3.t0, _context3.t1);case 5:case 'end':return _context3.stop();}}}, _callee3, undefined);}));return function (_x2, _x3) {return _ref5.apply(this, arguments);};}());


app.get('/hello/:name', function (req, res) {
  res.send('Hello ' + req.params.name);
});

// We name this function "route", which you can see is
// still surfaced in the HTTP URLs below.
exports.route = functions.https.onRequest(app);