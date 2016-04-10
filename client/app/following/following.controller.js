(function(){
  'use strict';
  /*jshint latedef: nofunc */

  angular
    .module('twitchGuiApp')
    .controller('FollowingController', followingCtrl);

  followingCtrl.$inject= ['TwitchAPI', 'KodiAPI', 'cookieSettingsFactory', 'warningModal'];

  function followingCtrl(TwitchAPI, KodiAPI, cookieSettingsFactory, warningModal) {
    /*jshint validthis:true */
    var vm = this;

    vm.streams = [];
    vm.nextUrl = '';
    vm.promises = [];
    vm.kodiBusy = false;
    vm.filterInput = '';

    // following
    vm.userName = '';

    // Loading button
    vm.loadingButtonText = 'Fetch more!';
    vm.loadingMore = false;

    vm.loadStreams = loadStreams;
    vm.play = play;
    vm.clearFilter = clearFilter;

    activate();

    function activate() {
      vm.userName = cookieSettingsFactory.getUsername();
      if(vm.userName !== undefined && vm.userName !== '') {
        loadStreams();
      }
    }

    function loadStreams() {
      disableLoadMoreButton();

      TwitchAPI.getFollowing(vm.userName, vm.nextUrl)
        .then(function(streams) {
          vm.nextUrl = streams._links.next;
          vm.streams = vm.streams.concat(streams.streams);
          addIndexToStreams(vm.streams);
          enableLoadMoreButton();
        }, function(){
          vm.loadingButtonText = 'Failed to load more!';
          vm.loadingMore = false;
        });
    }

    function play(name, index) {
      if(vm.kodiBusy) {
        return;
      }

      vm.kodiBusy = true;
      vm.promises[index] = KodiAPI.playStream(name);
      vm.promises[index].then(function() {
        vm.kodiBusy = false;
      }, function(error){
        warningModal.warn(error).
          result.then(function(){
            vm.kodiBusy = false;
          });
      });

    }

    function clearFilter() {
      vm.filterInput = '';
    }

    function disableLoadMoreButton() {
      vm.loadingButtonText = 'Fetching more...';
      vm.loadingMore = true;
    }

    function enableLoadMoreButton() {
      vm.loadingButtonText = 'Fetch more!';
      vm.loadingMore = false;
    }

    function addIndexToStreams(streams) {
      for(var i=0; i<streams.length; i++) {
        streams[i].index = i;
      }
    }
  }
})();
