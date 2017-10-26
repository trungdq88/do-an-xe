const morgan = require('morgan');
const fetch = require('node-fetch');
const app = require('express')();
const FormData = require('form-data');
const Airtable = require('airtable');

const bodyParser = require('body-parser');

const isDevelopment = process.argv[2] === 'dev';

app.use(morgan('combined'));
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

const SLACK_TOKEN = 'ZmAUnPLxNnfSdH0OlSp6wFnr';
const AIRTABLE_API_KEY = 'keyr23yt6W4vwV4zc';
const SLACK_INCOMING_HOOK =
  'https://hooks.slack.com/services/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';
const SLACK_APP_TOKEN = 'xoxb-254761642838-Ta2VbGf2N3vUvGYNl4salNEy';

const airTableApi = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
  'appkhdzUXxa4FWcih',
);

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
          text: fields['Tên món'] + ' (Mã số ' + fields['ID'] + ')',
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
              'Chọn số phần bên trên để đặt cho mình. Để đặt giùm người khác,' +
              ' mọi người vào link này nha:' +
              ' http://bit.ly/air-lounge-order-form :grin:',
          },
        ]),
    }),
  });
  return '';
};

const checkMenu = async params => {
  console.log('checkmenu', params);

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

  try {
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
    await sendMessageToUser(
      params.user_id,
      params.channel_id,
      `Có lỗi xảy ra. ${e}`,
    );
  }
};

const selectUserFullName = async (params, listStaff) => {
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
      title: 'Đặt món lần đầu',
      elements: [
        {
          label: 'Chọn tên của bạn',
          placeholder: '(Chỉ cần cài đặt trong lần đặt món đầu tiên)',
          type: 'select',
          name: 'airtable_staff_id',
          value: '',
          options: listStaff.map(staff => ({
            label: staff.fields['Họ tên'],
            value: staff.id,
          })),
        },
        {
          label: 'Số lượng',
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
) => {
  console.log('createOrder', {
    channelId,
    slackUserId,
    airTableStaffId,
    foodCount,
    foodId,
    remaining,
  });
  const remainingAfterUse =
    (remaining === undefined ? 20 : remaining) - Number(foodCount);

  let msg =
    `:white_check_mark: Bạn đã đặt thành công \`${foodCount}\` món!` +
    (remainingAfterUse <= 0
      ? ` Bạn đã hết coupon tháng này :wave:`
      : ` Tháng này bạn còn \`${remainingAfterUse}\` coupon. :hugging_face:`);

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
    msg = `:x: Có lỗi xảy ra, vui lòng thử lại. (${e})`;
  }

  const response = await sendMessageToUser(slackUserId, channelId, msg);

  console.log('Send success msg: ', response);

  return ''; // Return empty string to keep the original msg
};

const setUpUsernameAndOrder = async params => {
  const foodId = params.callback_id.replace(/set_up_username_/, '');

  if (!params.submission.airtable_staff_id) {
    return {
      errors: [
        {
          name: 'airtable_staff_id',
          error: 'Bạn cần phải chọn tên để đặt món!',
        },
      ],
    };
  }

  const airtableResponse = await new Promise((resolve, reject) =>
    airTableApi('Staff').update(
      params.submission.airtable_staff_id,
      {
        'Slack User ID': params.user.id,
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

  console.log('params', params);
  // Ignore the check remaining coupon step
  return await createOrder(
    params.channel.id,
    params.user.id,
    params.submission.airtable_staff_id,
    params.submission.food_count,
    foodId,
  );
};

const orderFood = async params => {
  const user = params.user;
  const action = params.actions.length ? params.actions[0] : null;
  const foodCount = action.selected_options[0].value;
  const foodId = params.callback_id.replace(/order_food_/, '');

  console.log('action', action);

  // We have to get ALL staff, because if current user is not mapped, we need
  // the list to display to user and ask them to choose
  const listStaff = await new Promise((resolve, reject) =>
    airTableApi('Staff').select().firstPage((err, records) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(records);
    }),
  );

  console.log('listStaff length', listStaff.length);

  const airTableUser = listStaff.filter(
    staff => staff.fields['Slack User ID'] === user.id,
  )[0];

  console.log('order by', user.id);

  if (!airTableUser) {
    console.log(
      `AirTable staff mapping for ${user.id} not found, sending dialog.`,
    );
    return selectUserFullName(params, listStaff);
  }

  const remaining = Number(airTableUser.fields['Số coupon còn lại*']);
  if (remaining <= 0) {
    await sendMessageToUser(
      user.id,
      params.channel.id,
      ':x: Rất tiếc bạn đã xài hết coupon tháng này. :pensive:',
    );
    return '';
  } else if (remaining < foodCount) {
    await sendMessageToUser(
      user.id,
      params.channel.id,
      `:x: Tháng này bạn chỉ còn \`${remaining}\` coupon, không đủ để đặt \`${foodCount}\` phần :scream:`,
    );
    return '';
  }

  console.log('params', params);
  return await createOrder(
    params.channel.id,
    user.id,
    airTableUser.id,
    foodCount,
    foodId,
    remaining,
  );
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
  app.listen(8010, function() {
    console.log('Example app listening on port 8010.');
  });
}
exports.doanxe = app;
