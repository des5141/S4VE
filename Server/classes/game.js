"use strict";
exports.__esModule = true;
var database_1 = require("./database");
var hash_1 = require("./hash");
var Game = /** @class */ (function () {
    function Game(teamA, teamB) {
        this.GameID = hash_1.autoHash();
        teamA.EnterGame(this.GameID);
        teamB.EnterGame(this.GameID);
        this.RedTeam = teamA;
        this.BlueTeam = teamB;
    }
    Game.prototype.UpGauge = function (team_name) {
        if (this.RedTeam.name == team_name) {
            this.RedTeam_gauge += 1;
        }
        else if (this.BlueTeam.name == team_name) {
            this.BlueTeam_gauge += 1;
        }
        else {
            console.error('게이지를 올리는 팀의 이름이 잘못되었습니다.');
        }
        this.CheckEnd();
    };
    Game.prototype.CheckEnd = function () {
        if (this.RedTeam_gauge == 100) {
            this.RedTeam.EndGame(true);
            this.BlueTeam.EndGame(false);
        }
        else if (this.BlueTeam_gauge == 100) {
            this.RedTeam.EndGame(false);
            this.BlueTeam.EndGame(true);
        }
        else {
        }
    };
    Game.prototype.toString = function () {
        var red = this.RedTeam.toString();
        var blue = this.BlueTeam.toString();
        var result = { id: this.GameID, RedTeam: red, BlueTeam: blue };
        return JSON.stringify(result);
    };
    return Game;
}());
exports.Game = Game;
var Team = /** @class */ (function () {
    function Team(team_number, team_name) {
        this.name = team_name;
        this.max_player = team_number;
        this.player_count = 0;
        this.players = new Array(team_number);
    }
    Team.prototype.EnterGame = function (game_id) {
        this.game_id = game_id;
    };
    Team.prototype.AddPlayer = function (player) {
        if (this.player_count == this.max_player) {
            console.error('최대 플레이어에 도달했습니다.');
        }
        else {
            this.players.push(player);
            this.player_count += 1;
        }
    };
    Team.prototype.EndGame = function (is_win) {
        var _this = this;
        this.players.forEach(function (player) {
            _this.SaveHistory(is_win, player);
        });
    };
    Team.prototype.SaveHistory = function (win, user) {
        user.SaveResultToDB(win, this.name, this.game_id);
    };
    Team.prototype.toString = function () {
        var result = "Players : \n";
        this.players.forEach(function (x) { result += " user : " + x.name; });
        return "TeamName : " + this.name + "  " + result + "\n";
    };
    return Team;
}());
exports.Team = Team;
var Player = /** @class */ (function () {
    function Player(id, name, champ) {
        this.id = hash_1.autoHash();
        this.userid = id;
        this.name = name;
        this.champion = champ;
        this.health = 100;
    }
    Player.prototype.Move = function (x, y) {
        this.positionX = x;
        this.positionY = y;
    };
    Player.prototype.Demaged = function (demage) {
        this.health -= demage;
    };
    Player.prototype.SaveResultToDB = function (win, team_name, game_id) {
        return database_1.save_play(this.id, this.userid, this.champion, win, team_name, game_id);
    };
    return Player;
}());
exports.Player = Player;
