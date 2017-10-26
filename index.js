const cache = require('memory-cache');
const morgan = require('morgan');
const fetch = require('node-fetch');
const app = require('express')();
const FormData = require('form-data');
const Airtable = require('airtable');
const bodyParser = require('body-parser');

// Disable log to save money
console.log = () => {};
app.use(morgan('combined'));

const SLACK_TOKEN =
  process.env.SLACK_TOKEN || console.error('SLACK_TOKEN not found');
const AIRTABLE_API_KEY =
  process.env.AIRTABLE_API_KEY || console.error('AIRTABLE_API_KEY not found');
const SLACK_INCOMING_HOOK =
  process.env.SLACK_INCOMING_HOOK ||
  console.error('SLACK_INCOMING_HOOK not found');
const SLACK_APP_TOKEN =
  process.env.SLACK_APP_TOKEN || console.error('SLACK_APP_TOKEN not found');

const isDevelopment = process.argv[2] === 'dev';

if (isDevelopment) {
  app.use(bodyParser.urlencoded({ extended: false }));
}

const fetchLog = (...args) => {
  console.log('>>> Request: ', args);
  return fetch(...args).then(r => {
    console.log('>>> Response: ', r);
    return r;
  });
};

const fetchJson = (...args) =>
  fetchLog(...args).then(r => r.json()).then(json => {
    console.log('>>> Response JSON: ', json);
    return json;
  });

const airTableApi = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
  'appkhdzUXxa4FWcih',
);

const withCache = async (cacheKey, cacheDurationInMillis, getPromise) => {
  const existingCache = cache.get(cacheKey);
  if (existingCache !== null) {
    console.log('cache hit', cacheKey, existingCache);
    return existingCache;
  }

  return getPromise().then(r => {
    console.log('cache put', cacheKey, r);
    cache.put(cacheKey, r, cacheDurationInMillis);
    return r;
  });
};

const checkFormAvailable = async () => {
  // Cache for 1 minute
  return withCache('checkFormAvailable', 60 * 1000, async () => {
    const response = await fetchLog('https://airtable.com/shrWEveNbdsQyNT8M');
    return response.status === 200;
  });
};

const postToSlack = async foods => {
  await fetchLog(SLACK_INCOMING_HOOK, {
    method: 'POST',
    body: JSON.stringify({
      text:
        '<!channel> Hi mọi người, thức ăn xế hôm nay có những món sau đây. ' +
        'Mọi người nhanh tay submit đặt món nhé. :alarm_clock: Em chốt order ' +
        'lúc *11:20am* hen! Sau giờ này, đường link sẽ bị disabled, các bạn ' +
        'sẽ không đặt thêm được nữa nên mọi người tranh thủ nha :smile: ' +
        'Thanks.',
      attachments: foods
        .map(({ fields, id }) => ({
          parse: 'full',
          title: fields['Tên món'] + ' (Mã số ' + fields['ID'] + ')',
          ...(fields['Mô tả'] ? { text: fields['Mô tả'] } : {}),
          fallback: 'Bạn không thể đặt món',
          callback_id: 'order_food_' + id,
          attachment_type: 'default',
          image_url: fields['Hình ảnh']
            ? (fields['Hình ảnh'].filter(
                ({ type }) => type === 'image/jpeg',
              )[0] || {}).url || ''
            : '',
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
                20,
              ].map(i => ({
                text: 'Đặt ' + i + ' phần',
                value: i,
              })),
            },
          ],
        }))
        .concat([
          {
            text:
              ':raising_hand: Chọn số phần bên trên để đặt món.\n' +
              ':memo: Link đặt món trên web:' +
              ' http://bit.ly/air-lounge-order-form',
          },
        ]),
    }),
  });
  return '';
};

const checkMenu = async params => {
  console.log('checkmenu', params);

  try {
    const findUser = await new Promise((resolve, reject) =>
      airTableApi('Staff')
        .select({
          filterByFormula: `{Slack User ID}='${params.user_id}'`,
        })
        .firstPage((err, records) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(records);
        }),
    );

    if (!findUser.length || findUser[0].fields.Admin !== true) {
      await sendMessageToUser(
        params.user_id,
        params.channel_id,
        'Chỉ có admin dễ thương mới được xài lệnh này :)',
      );
      return;
    }

    console.log('List menu by', findUser[0]);

    const todayFood = await new Promise((resolve, reject) =>
      airTableApi('Menu')
        .select({
          filterByFormula: '{Món hôm nay}',
        })
        .firstPage((err, records) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(records);
        }),
    );
    return await postToSlack(todayFood);
  } catch (e) {
    console.error(e);
    await sendMessageToUser(
      params.user_id,
      params.channel_id,
      `Có lỗi xảy ra. (${e})`,
    );
  }
};

const selectUserFullName = async (params, listStaff, airTableStaffId) => {
  const action = params.actions.length ? params.actions[0] : null;
  const foodCount = action.selected_options[0].value;
  const foodId = params.callback_id.replace(/order_food_/, '');
  // Open dialog
  const form = new FormData();
  form.append('token', SLACK_APP_TOKEN);
  form.append(
    'dialog',
    JSON.stringify({
      callback_id: 'set_up_username_' + foodId,
      title: 'Đặt đồ ăn xế',
      elements: [
        {
          label: 'Chọn tên của bạn',
          type: 'select',
          name: 'airtable_staff_id',
          value: airTableStaffId || '',
          options: listStaff.map(staff => ({
            label: staff.fields['Họ tên'],
            value: staff.id,
          })),
        },
        {
          label: 'Ghi nhớ tên này?',
          type: 'select',
          name: 'remember_staff_id',
          value: 'no',
          options: [
            {
              label: 'Không (lần sau đặt món sẽ chọn lại tên)',
              value: 'no',
            },
            {
              label: 'Có (lần sau tự động đặt theo tên đã chọn)',
              value: 'yes',
            },
          ],
        },
        {
          label: 'Số phần đặt',
          type: 'text',
          name: 'food_count',
          value: foodCount,
        },
      ],
    }),
  );
  form.append('trigger_id', params.trigger_id);
  const response = await fetchJson('https://slack.com/api/dialog.open', {
    method: 'post',
    body: form,
  });
  console.log('Send dialog:', response);
  if (!response.ok) {
    await sendMessageToUser(
      params.user.id,
      params.channel.id,
      `Hệ thống bị lỗi. Vui lòng thử lại sau. (${response.error})`,
    );
  }
  return '';
};

const sendMessageToUser = async (slackUserId, channelId, msg) => {
  const form = new FormData();
  form.append('token', SLACK_APP_TOKEN);
  form.append('channel', channelId);
  form.append('text', msg);
  form.append('user', slackUserId);
  return await fetchJson('https://slack.com/api/chat.postEphemeral', {
    method: 'post',
    body: form,
  });
};

const createOrder = async (
  channelId,
  slackUserId,
  airTableStaffId,
  foodCount,
  foodId,
  remaining,
  username,
) => {
  console.log('createOrder', {
    channelId,
    slackUserId,
    airTableStaffId,
    foodCount,
    foodId,
    remaining,
    username,
  });
  const remainingAfterUse =
    (remaining === undefined ? 20 : remaining) - Number(foodCount);

  let msg =
    `:white_check_mark: \`${username ||
      'Bạn'}\` đã đặt thành công \`${foodCount}\` món!` +
    (remainingAfterUse <= 0
      ? ` Đã xài hết coupon tháng này :wave:`
      : ` Tháng này còn \`${remainingAfterUse}\` coupon. :hugging_face:`);

  try {
    const createOrderResponse = await new Promise((resolve, reject) =>
      airTableApi('Order').create(
        {
          'Tên nhân viên': [airTableStaffId],
          'Món ăn ID': [foodId],
          'Số phần ăn': Number(foodCount),
        },
        (err, record) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(record);
        },
      ),
    );
    console.log('createOrderResponse', createOrderResponse);
  } catch (e) {
    console.error(e);
    msg = `:x: Có lỗi xảy ra, vui lòng thử lại. (${e})`;
  }

  sendMessageToUser(slackUserId, channelId, msg);

  return ''; // Return empty string to keep the original msg
};

const setUpUsernameAndOrder = async params => {
  const foodId = params.callback_id.replace(/set_up_username_/, '');
  const foodCount = params.submission.food_count;
  const userId = params.user.id;
  const channelId = params.channel.id;
  const airTableStaffId = params.submission.airtable_staff_id;

  try {
    if (!airTableStaffId) {
      return {
        errors: [
          {
            name: 'airtable_staff_id',
            error: 'Bạn cần phải chọn tên để đặt món!',
          },
        ],
      };
    }
    if (!/^\d+$/.test(foodCount) || Number(foodCount) <= 0) {
      return {
        errors: [
          {
            name: 'food_count',
            error: 'Số phần ăn không đúng',
          },
        ],
      };
    }

    let remaining = 20;
    let username = '';
    const updateFields = { 'Slack User ID': params.user.id };
    if (params.submission.remember_staff_id === 'yes') {
      updateFields['Remember'] = true;
    }

    const airtableResponse = await new Promise((resolve, reject) =>
      airTableApi('Staff').update(
        params.submission.airtable_staff_id,
        updateFields,
        (err, record) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(record);
        },
      ),
    );
    console.log(
      'Update slack user id for staff',
      params.user,
      params.submission,
      airtableResponse,
    );
    remaining = Number(airtableResponse.fields['Số coupon còn lại*']);
    username = airtableResponse.fields['Họ tên'];

    const checkRemaining = await checkRemainingCoupon(
      remaining,
      foodCount,
      userId,
      channelId,
      username,
    );
    if (checkRemaining !== true) {
      return checkRemaining;
    }

    console.log('setUpUsernameAndOrder', params);
    // Ignore the check remaining coupon step
    createOrder(
      channelId,
      userId,
      airTableStaffId,
      foodCount,
      foodId,
      remaining,
      username,
    );
    return '';
  } catch (e) {
    console.error(e);
    sendMessageToUser(userId, channelId, `:x: Lỗi hệ thống (${e}) `);
    return '';
  }
};

const checkRemainingCoupon = async (
  remaining,
  foodCount,
  userId,
  channelId,
  username,
) => {
  if (remaining <= 0) {
    await sendMessageToUser(
      userId,
      channelId,
      `:x: Rất tiếc \`${username || 'bạn'}\` đã xài` +
        ` hết coupon tháng này. :pensive:`,
    );
    return '';
  } else if (remaining < foodCount) {
    await sendMessageToUser(
      userId,
      channelId,
      `:x: Tháng này \`${username || 'bạn'}\` chỉ còn \`${remaining}\` ` +
        `coupon, không đủ để đặt \`${foodCount}\` phần :scream:`,
    );
    return '';
  }
  return true;
};

const getAllAirTableStaff = async () =>
  new Promise((resolve, reject) =>
    airTableApi('Staff').select().firstPage((err, records) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(records);
    }),
  );

const orderFood = async params => {
  const user = params.user;
  const action = params.actions.length ? params.actions[0] : null;
  const foodCount = action.selected_options[0].value;
  const foodId = params.callback_id.replace(/order_food_/, '');

  console.log('action', action);

  try {
    // We have to get ALL staff, because if current user is not mapped, we need
    // the list to display to user and ask them to choose
    const listStaff = await getAllAirTableStaff();

    console.log('listStaff length', listStaff.length);

    const airTableUser = listStaff.filter(
      staff => staff.fields['Slack User ID'] === user.id,
    )[0];

    console.log('order by', user.id);

    if (!airTableUser || airTableUser.fields['Remember'] !== true) {
      console.log(
        `AirTable staff mapping for ${user.id} not found, sending dialog.`,
      );
      return selectUserFullName(
        params,
        listStaff,
        airTableUser ? airTableUser.id : undefined,
      );
    }

    const remaining = Number(airTableUser.fields['Số coupon còn lại*']);
    const username = airTableUser.fields['Họ tên'];
    const checkRemaining = await checkRemainingCoupon(
      remaining,
      foodCount,
      user.id,
      params.channel.id,
      username,
    );
    if (checkRemaining !== true) {
      return checkRemaining;
    }

    console.log('params', params);
    return await createOrder(
      params.channel.id,
      user.id,
      airTableUser.id,
      foodCount,
      foodId,
      remaining,
      username,
    );
  } catch (e) {
    console.error(e);
    sendMessageToUser(user.id, params.channel.id, `:x: Lỗi hệ thống (${e})`);
    return '';
  }
};

app.get('/', (req, res) => {
  res.send(`Go home, you are drunk`);
});

app.post('/test-post-to-slack', async (req, res) => {
  res.send(await checkMenu());
});

app.post('/order', async (req, res) => {
  const params = JSON.parse(req.body.payload);

  if (!params.token || params.token !== SLACK_TOKEN) {
    res.send('No.');
    return;
  }

  if (!await checkFormAvailable()) {
    await sendMessageToUser(
      params.user.id,
      params.channel.id,
      ':x: Admin đã chốt order mất rồi, ko đặt được nữa :disappointed:',
    );
    res.send('');
    return;
  }

  console.log('callback_id', params.callback_id);
  if (params.callback_id.indexOf('order_food_') === 0) {
    orderFood(params);
    await sendMessageToUser(
      params.user.id,
      params.channel.id,
      'Đang đặt món, chờ xíu nha...',
    );
    res.send('');
  } else if (params.callback_id.indexOf('set_up_username_') === 0) {
    res.send(await setUpUsernameAndOrder(params));
  }
});

app.post('/list', async (req, res) => {
  if (!req.body.token || req.body.token !== SLACK_TOKEN) {
    res.send('No.');
    return;
  }
  checkMenu(req.body);
  res.send('Đang đăng tin, chờ xíu nha...');
});

app.get('/hello', async (req, res) => {
  res.send('hello from expressjs.');
});

if (isDevelopment) {
  const port = 8010;
  app.listen(port, function() {
    console.log(`Example app listening on port ${port}.`);
  });
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

exports.doanxe = app;
