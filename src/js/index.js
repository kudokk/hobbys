/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var quests = require('../data/quest.json');
var hobbys = require('../data/hobby.json');

var app = {
  questCount: 0,
  // 質問の番号
  rQN: 0,
  // 趣味の番号
  rHO: 0,
  // 質問の番号の配列
  qNArray: [],
  // 趣味のステータスと番号
  hObject: {"sociability": [],"collect": [],"multiPlay": [],"selfPolishing": [],"art": [],"sport": [],"it": [],"margin": [],"costPerformance": []},
  // 質問用のランダムカウント
  nRCount: 0,
  // 趣味用のランダムカウント
  oRCount: 0,
  matchPercent: 0,
  baseRankArray: {},
  hobbyRankArray: {},
  userStatusRank: {},
  condidateItems: document.querySelectorAll('.js-condidate-item'),
  condidateLinks: document.querySelectorAll('.js-condidate-link'),
  hobbyItems: document.querySelectorAll('.js-hobby-item'),
  hobbyDescs: document.querySelectorAll('.js-hobby-desc'),
  hobbyLinks: document.querySelectorAll('.js-hobby-link'),
  hobbyList: document.querySelectorAll('.js-hobby-list')[0],

  // Application Constructor
  initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
      this.attachEvent();
  },

  // ------------------------------- クリックイベント(controller) -------------------------------------
  attachEvent: function() {
    // メイン部分の非表示、クエストエリアの表示
    var start = document.querySelectorAll('.js-start');
    var main = document.querySelectorAll('.js-main');
    var questArea = document.querySelectorAll('.js-questArea');
    var overlay = document.querySelectorAll('.js-overlay');
    var hobbyArea = document.querySelectorAll('.js-hobbyArea');
    var reset = document.querySelectorAll('.hobby__reset');

    start = Array.prototype.slice.call(start);
    main = Array.prototype.slice.call(main);

    // 趣味を探すボタン押下時
    start[0].addEventListener('click', function() {
      // リセット
      app.questCount = 0;
      app.qNArray = [];
      app.resetStatus();
      // 出題
      app.rQN = app.random(quests.quests.quest);
      app.nextQuest();
      main[0].classList.add('js-none');
      questArea[0].classList.remove('js-none');
    })

    // 質問の答え押下時
    app.condidateLinks.forEach(function(e, i) {
      e.addEventListener('click', function() {
        if (app.questCount >= 10 && app.questCount < quests.quests.quest.length) {
          app.calRank();
          app.getUserRankStatus();
          // 趣味の表示開始
          app.showHobby();
        }else if (app.questCount === quests.quests.quest.length) {
          // 終了のお知らせ
          console.log('終了');
          questArea[0].classList.add('js-none');
          overlay[0].classList.add('js-none');
        }
        var status = quests.quests.quest[app.rQN].choise[i].status;
        var resultStatus = app.calStatus(status);
        app.setStatus(resultStatus);
        app.nRCount = 0;
        app.newRandomNumber();
      })
    })

    // やり直すボタン押下時
    reset[0].addEventListener('click', function(e, i) {
      // スタート要素表示
      main[0].classList.remove('js-none');
      questArea[0].classList.add('js-none');
      app.hobbyDescs.forEach(function(e, i) {
        e.classList.add('js-none');
      })
      var hobbyArea = document.querySelectorAll('.js-hobbyArea')[0];
      hobbyArea.style.opacity = 0;
      hobbyArea.classList.remove('js-show');
      setTimeout((function() {
        hobbyArea.style.display = 'none';
      }), 1000)
    })

    // 趣味候補ボタン押下時
    app.hobbyLinks.forEach(function(e, i) {
      e.addEventListener('click', function(ev, ix) {
        questArea[0].classList.add('js-none');
        app.hobbyDescs.forEach(function(e, i) {
          e.classList.remove('js-none');
        })
      })
    })
    // 質問の答え押下時
    for (j = 0, num = app.hobbyItems.length; j < num; j++) {
      ripple = app.hobbyItems[j];
      ripple.addEventListener('mousedown', function(e) {
        ripple = this;//クリックされたボタンを取得
        cover = document.createElement('span');//span作る
        coversize = ripple.offsetWidth;//要素の幅を取得
        loc = ripple.getBoundingClientRect();//絶対座標の取得
        x = e.pageX - loc.left - window.pageXOffset - (coversize / 2);
        y = e.pageY - loc.top - window.pageYOffset - (coversize / 2);
        pos = 'top:' + y + 'px; left:' + x + 'px; height:' + coversize + 'px; width:' + coversize + 'px;';

        //spanを追加
        ripple.appendChild(cover);
        cover.setAttribute('style', pos);
        cover.setAttribute('class', 'rp-effect');//クラス名追加

        //しばらくしたらspanを削除
        setTimeout(function() {
          var list = document.getElementsByClassName( "rp-effect" ) ;
          for(var i =list.length-1;i>=0; i--){//末尾から順にすべて削除
            list[i].parentNode.removeChild(list[i]);
        }}, 2000)
      });
    }
  },

  nextQuest: function(r) {
    var questText = document.querySelectorAll('.js-questText');
    var quest = quests.quests.quest[app.rQN];
    questText[0].innerText = quest.ask;
    var condidateLength = quest.choise.length;

    for (var i = 0; i < app.condidateLinks.length; i++) {
      app.condidateItems[i].classList.add('js-none');
      if (i < condidateLength) {
        app.condidateItems[i].classList.remove('js-none');
        app.condidateLinks[i].innerText = quest.choise[i].text;
      }
    }
    app.questCount++;
  },

  // 単純に数字を返却
  random: function(array) {
    var length = array.length;
    var r = Math.floor( Math.random() * length );
    return r;
  },

  judgeRandomNumber: function(array, number) {
    var flg = true;
    array.forEach(function(e) {
      if (e === number) {
        flg = false;//等しいものがある
      }
    })
    return flg;
  },

  // 違う数字が出るまでjudgeRandomNumber実行
  newRandomNumber: function() {
    app.nRCount++;
    app.rQN = app.random(quests.quests.quest);
    var flg = app.judgeRandomNumber(app.qNArray, app.rQN);
    if (flg) { //今まで出ていない数字
      app.qNArray.push(app.rQN)
      app.nextQuest();
    } else if(app.nRCount < 50) {
      app.newRandomNumber();
      // 同じ問題ばかり出てしまう問題
    }
  },

  // 違う数字が出るまでjudgeRandomNumber実行
  newRandomHobbyNumber: function(hobbyResultArray, status) {
    app.oRCount++;
    app.rHO = app.random(hobbyResultArray);
    var flg = app.judgeRandomNumber(app.hObject[status], app.rHO);
    if (flg) { //今まで出ていない数字
      app.hObject[status].push(app.rHO)
      return app.rHO
    } else if(app.oRCount < 50) {
      app.newRandomHobbyNumber(hobbyResultArray, status);
      // 同じ問題ばかり出てしまう問題
    }
  },

  calStatus: function(status) {
    var resultStatus = app.getStatus();
    Object.keys(status).forEach(function(key) {
      resultStatus[key] += status[key];
    })
    return resultStatus;
  },

  setStatus: function(status) {
    localStorage.setItem('status', JSON.stringify(status));
  },

  getStatus: function() {
    var status = JSON.parse(localStorage.getItem('status'));
    if (status === null) {
      var status = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    }
    return status;
  },

  resetStatus: function() {
    var status = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    app.setStatus(status);
  },

  showHobby: function() {
    var hobbyArea = document.querySelectorAll('.js-hobbyArea')[0];
    hobbyArea.style.opacity = 0;
    hobbyArea.style.display = 'block';
    setTimeout( function () {
      hobbyArea.style.opacity = 1;
    }, 200);
    var hobbyArray = [];
    for (var i = 0; i < app.hobbyItems.length; i++) {
      // statusに応じた2個だけ表示
      var hobby = app.getHobbyRanks();
      if (typeof hobby !== 'undefined') {
        hobbyArray.push(hobby);
        app.hobbyLinks[i].querySelectorAll('.js-hobby-text')[0].innerText = hobby.name;
        app.hobbyDescs[i].innerText = hobby.status.text
        app.hobbyItems[i].classList.remove('js-none');
      }
    }
    hobbyArea.classList.add('js-show');
  },

  // ------------------------------- 答えた質問を元にベースランク作成 -------------------------------------
  calRank: function() {
    var questLength = app.qNArray.length
    var baseStatusMax = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    var baseStatusMin = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    for (var i = 0; i < questLength; i++) {
      var choise = quests.quests.quest[app.qNArray[i]].choise;
      var statusMax = app.getStatusMax(choise);
      var statusMin = app.getStatusMin(choise);
      Object.keys(baseStatusMax).forEach(function(key) {
        if (statusMax[key] > 0) {
          baseStatusMax[key] += statusMax[key];
        } else {
          baseStatusMax[key] -= statusMax[key];
        }

        if (statusMin[key] > 0) {
          baseStatusMax[key] -= statusMax[key];
        } else {
          baseStatusMax[key] += statusMax[key];
        }
      })
    }
    console.log(baseStatusMax)
    // ステータスの範囲を自然数で表現
    var statusNatural = app.getNaturalStatus(baseStatusMax, baseStatusMin);
    // ステータスをそれぞれ５分割した時の数を配列として保存
    var rankDistribute = app.getRankDistrbute(statusNatural);
    app.baseRankArray = app.getRankArray(rankDistribute, baseStatusMin);
    console.log(app.baseRankArray)
  },

  getStatusMax: function(choise) {
    var resultStatus = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    for (var i = 0; i < choise.length; i++) {
      Object.keys(choise[i].status).forEach(function(key) {
        if (resultStatus[key] < choise[i].status[key]) {
          resultStatus[key] = choise[i].status[key];
        }
      })
    }
    return resultStatus;
  },

  getStatusMin: function(choise) {
    var resultStatus = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    for (var i = 0; i < choise.length; i++) {
      Object.keys(choise[i].status).forEach(function(key) {
        if (resultStatus[key] > choise[i].status[key]) {
          resultStatus[key] = choise[i].status[key];
        }
      })
    }
    return resultStatus;
  },

  getNaturalStatus: function(statusMax, statusMin) {
    var resultStatus = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    Object.keys(statusMax).forEach(function(key) {
      if (statusMin[key] < 0) {
        resultStatus[key] = statusMax[key] - statusMin[key];
      }else {
        resultStatus[key] = statusMax[key]
      }
    })

    return resultStatus;
  },

  getRankDistrbute: function(statusNatural) {
    var resultStatus = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    Object.keys(statusNatural).forEach(function(key) {
      var rankDistriArray = [];
      for (var i = 0; i < 5; i++) { //5ランクに分ける
        rankDistriArray.push(Math.floor((statusNatural[key] + i) / 5));
      }
      resultStatus[key] = rankDistriArray;
    })
    return resultStatus;
  },

  getRankArray: function(rankDistribute, baseStatusMin) {
    var resultStatus = {"sociability": 0,"collect": 0,"multiPlay": 0,"selfPolishing": 0,"art": 0,"sport": 0,"it": 0,"margin": 0,"costPerformance": 0};
    Object.keys(rankDistribute).forEach(function(key) {
      var rankArray = [];
      rankArray.push(baseStatusMin[key]);
      for (var i = 0; i < 5; i++) {
        rankArray.push(baseStatusMin[key] + rankDistribute[key][i]);
        baseStatusMin[key] += rankDistribute[key][i];
      }
      resultStatus[key] = rankArray;
    })
    return resultStatus;
  },

  getHobbyRanks: function() {
    var hobbyLength = hobbys.hobbys.hobby.length;
    var rankArray = [];

    for (var i = -2; i < 3; i++) {
      var hobbyRank = {"sociability": [],"collect": [],"multiPlay": [],"selfPolishing": [],"art": [],"sport": [],"it": [],"margin": [],"costPerformance": []};
      for (var j = 0; j < hobbyLength; j++) {
        Object.keys(hobbys.hobbys.hobby[j].status).forEach(function(key) {
          if (hobbys.hobbys.hobby[j].status[key] === i) {
            hobbyRank[key].push(j);
          }
        })
      }
      var rank = {};
      rank[i] = hobbyRank;
      rankArray.push(rank);
    }
    app.hobbyRankArray = rankArray;
    console.log('--app.hobbyRankArray--')
    console.log(app.hobbyRankArray)
    var hobbyNumber = app.getHobbyNumber();
    return hobbys.hobbys.hobby[hobbyNumber];
  },

  // ------------------------------- ユーザーのステータスのランク付け -------------------------------------
  getUserRankStatus: function() {
    var userStatus = app.getStatus();
    console.log('--getUserRankStatus--')
    console.log(userStatus)
    console.log(app.baseRankArray)
    Object.keys(userStatus).forEach(function(key) {
      for (var i = 0; i < app.baseRankArray[key].length; i++) {
        if (userStatus[key] <= app.baseRankArray[key][i]) {
          userStatus[key] = i - 2;
          break;
        }
      }
    })
    console.log(userStatus)
    app.userStatusRank = userStatus;
  },

  // ------------------------------- ユーザーのランクを元に推薦趣味を取得 -------------------------------------
  getHobbyNumber: function() {
    var min = -3;
    Object.keys(app.userStatusRank).forEach(function(key) {
      if (min < app.userStatusRank[key]) {
        console.log(app.userStatusRank[key])
        min = app.userStatusRank[key];
      };
    })
    var maxStatus = [];
    Object.keys(app.userStatusRank).forEach(function(key) {
      if (min === app.userStatusRank[key]) {
        maxStatus.push(key);
      };
    })
    var r = app.random(maxStatus); //どのステータスを基準にするかランダム選択
    var maxStatus = maxStatus[r];
    console.log('--app.hobbyRankArray[min]--')
    console.log(app.hobbyRankArray)
    console.log(min)
    var hobbyRankArray = app.hobbyRankArray[min];
    console.log(hobbyRankArray)
    var hobbyResultArray;
    Object.keys(hobbyRankArray).forEach(function(key) {
      hobbyResultArray = hobbyRankArray[key][maxStatus];
    })
    var r = app.newRandomHobbyNumber(hobbyResultArray, maxStatus);  //選ばれたステータスの中で趣味をランダム選択
    return hobbyResultArray[r];
  }
}

app.initialize();
