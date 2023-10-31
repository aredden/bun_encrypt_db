import axios from 'axios';

const lorum_ipsum =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor';

axios
	.post(
		'http://localhost:9234/api/post',
		'hello world, this is a test, please ignore, thank you! :) ' + lorum_ipsum
	)
	.then((res) => {
		console.log(res.data, res.statusText, res.status);
	})
	.catch((err) => {
		console.error(err);
	});
