import Lottie from 'lottie-react-web';
import React from 'react';
import LoadingAnimation from './assets/loading.json';

const Loading = () => {
	return (
		<div className="loading">
			<Lottie
				options={{
					animationData: LoadingAnimation
				}}
			/>
		</div>
	);
};

export default Loading;
