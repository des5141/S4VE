import DB from './database';
import HASH from './hash';

export class Game {
    GameID: string;
    RedTeam_gauge: number;
    BlueTeam_gauge: number;
    RedTeam: Team;
    BlueTeam: Team;
    constructor(teamA: Team, teamB: Team) {
        this.GameID = HASH.autoHash();
        teamA.EnterGame(this.GameID);
        teamB.EnterGame(this.GameID);
        this.RedTeam = teamA;
        this.BlueTeam = teamB;
    }
    UpGauge(team_name: string) {
        if (this.RedTeam.name == team_name) {
            this.RedTeam_gauge += 1;
        } else if (this.BlueTeam.name == team_name) {
            this.BlueTeam_gauge += 1;
        } else {
            console.error('게이지를 올리는 팀의 이름이 잘못되었습니다.');
        }
        this.CheckEnd();
    }
    CheckEnd() {
        if (this.RedTeam_gauge >= 100) {
            this.RedTeam.EndGame(true);
            this.BlueTeam.EndGame(false);
        } else if (this.BlueTeam_gauge >= 100) {
            this.RedTeam.EndGame(false);
            this.BlueTeam.EndGame(true);
        } else {

        }
    }
    toString(){
        var red = this.RedTeam.toString();
        var blue = this.BlueTeam.toString();
        const result = {id:this.GameID,RedTeam:red,BlueTeam:blue};
        return JSON.stringify(result);
    }
    MovePlayer(id:string,x:number,y:number){
        this.RedTeam.MovePlayer(id,x,y);
        this.BlueTeam.MovePlayer(id,x,y);
    }
    isGuageIN(){

    }
}
export class Team {
    private players: Array<Player>;
    public name: string;
    private max_player: number;
    private player_count: number;
    private game_id: string;
    constructor(team_number: number, team_name: string) {
        this.name = team_name;
        this.max_player = team_number;
        this.player_count = 0;
        this.players = new Array<Player>(team_number);
    }
    EnterGame(game_id: string) {
        this.game_id = game_id;
    }
    AddPlayer(player: Player) {
        if (this.player_count == this.max_player) {
            console.error('최대 플레이어에 도달했습니다.');
        } else {
            this.players.push(player);
            this.player_count += 1;
        }
    }
    EndGame(is_win: boolean) {
        this.players.forEach((player) => {
            this.SaveHistory(is_win, player)
        })
    }
    SaveHistory(win: boolean, user: Player) {
        if(win){
            user.SaveResultToDB(10, this.name, this.game_id);
        }else{
            user.SaveResultToDB(-10, this.name, this.game_id);
        }

    }
    FindPlayer(id:string){
        for (let i = 0; i < this.players.length; i++) {
            const element = this.players[i];
            if(element.userid==id)
                return i;
        }
    }
    MovePlayer(id:string,x:number,y:number){
        const player_location = this.FindPlayer(id);
        if(player_location>=0){
            this.players[player_location].Move(x,y);
        }
    }
    toString(){
        var result = "Players : \n";            
        this.players.forEach(x=>{result+=" user : "+x.name;});
        return "TeamName : "+this.name+"  "+result+"\n";
    }
}
export class Player {

    userid: string;
    private id: string;
    positionX: number;
    positionY: number;
    name: string;
    champion: string;
    health: number;
    constructor(id: string, name: string, champ: string) {
        this.id = HASH.autoHash();
        this.userid = id;
        this.name = name;
        this.champion = champ;
        this.health = 100;
    }
    Move(x: number, y: number) {
        this.positionX = x;
        this.positionY = y;
    }
    Demaged(demage: number) {
        this.health -= demage;
    }
    SaveResultToDB(win: number, team_name: string, game_id: string) {
        if(win>0){
            DB.showmeyhemoney(this.userid,500);
        }else{
            DB.showmeyhemoney(this.userid,50);
        }
        DB.raise_point(win)(this.userid);
        return DB.save_play(this.id, this.userid, this.champion, win, team_name, game_id);
    }
}