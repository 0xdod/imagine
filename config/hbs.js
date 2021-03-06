const path = require('path');

const exphbs = require('express-handlebars');
const moment = require('moment');
const cloudinary = require('cloudinary').v2;

var blocks = {};
const setup = app => {
	return exphbs.create({
		extname: '.hbs',
		defaultLayout: 'main',
		layoutsDir: path.join(app.get('views'), '/layouts'),
		partialsDir: [path.join(app.get('views'), '/partials')],
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
		helpers: {
			block: function (name) {
				var val = (blocks[name] || []).join('\n');
				blocks[name] = [];
				return val;
			},
			eq: (a, b) => a === b,
			not: a => !a,
			extend: function (name, options) {
				var block = blocks[name];
				if (!block) {
					block = blocks[name] = [];
				}
				block.push(options.fn(this));
			},
			timeago: ts => moment(ts).startOf('minute').fromNow(),
			print: a => {
				console.log(a);
			},
			static: file => {
				return path.join(app.get('static_url'), file);
			},
			dict: (...slice) => {
				var obj = {};
				if (slice.length % 2 != 0) {
					slice.pop();
				}
				for (let i = 0; i < slice.length; i += 2) {
					if (i === '') continue;
					obj[slice[i]] = slice[i + 1];
				}
				return obj;
			},
			thumbnail: (url, opts = { h: 320, w: 320 }) => {
				const image = path.basename(url);
				if (app.get('env') === 'production') {
					return cloudinary.url(image, buildThumbnailOptions(opts));
				}

				var newUrl = `/images/thumbs/i/${image}`;
				var i = 0;
				for (let opt in opts) {
					if (i > 0) {
						newUrl += '&';
					}
					newUrl += `?${opt}=${opts[opt]}`;
				}
				return newUrl;
			},
			getEnv: () => app.get('env'),
			callMethod: (obj, methodName, param) => {
				return obj[methodName](param);
			},
		},
	});
};

module.exports = {
	setup,
};

function buildThumbnailOptions(params) {
	const allOptions = {
		height: Number(params.h),
		percentage: Number(params.p),
		width: Number(params.w),
	};

	const options = {};
	for (let prop in allOptions) {
		if (allOptions[prop]) {
			options[prop] = allOptions[prop];
		}
	}
	return options;
}
