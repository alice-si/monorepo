angular.module('aliceApp')
  .controller('ProjectControllerV2', ['$uibModal', '$stateParams', 'ProjectService',  '$scope', '$state', '$timeout', 'CheckoutService', function($uibModal, $stateParams, ProjectService, $scope, $state, $timeout, CheckoutService) {
    var vm = this;

		ProjectService.getProjectDetails($stateParams.projectCode).then(function (result) {
			vm.model = ProjectService.prepareProjectDetails(result.data);
			vm.supporters = result.data.supporters;

			vm.model._outcomes.forEach((elem) => {
				let impact = vm.model.goalsV2.find((e) => {
					if(e._id === elem._id){
						return e
					}
				});
				if(impact) {
					elem.totalPercentage = Math.floor(100 * impact.totalValidatedForOutcome / elem.amount);
					elem.totalValidatedForOutcome = impact.totalValidatedForOutcome;
				} else {
					elem.totalPercentage = 0;
					elem.totalValidatedForOutcome = 0;
				}
				elem.lightColor = elem.color ? convertHex(elem.color, 0.4) : 'rgba(255, 255, 255, 0.3)';
			});

			vm.goals = _.chunk(vm.model._outcomes, 3);

			vm.model.percentageCompleted = Math.floor((100 * vm.model.amountValidated) / vm.model.fundingTarget);
		});
		function convertHex(hex, opacity) {
			hex = hex.replace('#','');
			let r = parseInt(hex.substring(0,2), 16);
			let g = parseInt(hex.substring(2,4), 16);
			let b = parseInt(hex.substring(4,6), 16);

			let result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
			return result;
		}

		vm.donate = function() {
			CheckoutService.startCheckout(vm.model);
		}

		$scope.scrollGoal = function(direction) {
			let position = (direction === 'left') ? '-=300': '+=300';
			angular.element('#appeal-goals').animate({ scrollLeft: position }, 400);
			event.preventDefault();
		}

		$scope.scrollStory = function(direction) {
			let width = angular.element('.appeal-v3__stories-container').width() + 20;
			let position = (direction === 'left') ? '-=' + width : '+=' + width;
			angular.element('#appeal-stories').animate({ scrollLeft: position }, 400);
			event.preventDefault();
		}
}])
.directive('appealGoal', function() {
	return {
		scope: {
			goal: '=',
			index: '='
		},
		templateUrl: '/components/project/components/singleGoalComponent.html',
		controller: ['$scope', function ($scope) {
			$scope.hoverOn = function(goal) {
				$scope.activeGoal = goal;
			};
			$scope.hoverOff = function() {
				$scope.activeGoal = undefined;
			};
		}]
	};
})
.directive('appealStory', function() {
	return {
		scope: {
			story: '='
		},
		templateUrl: 'components/project/components/singleStoryComponent.html',
	};
});
