const assert = require('assert');
const Game = require('../classes/game').Game;
const Team = require('../classes/game').Team;
const Player = require('../classes/game').Player;
describe('player test',()=>{
    it('create',()=>{
        assert.doesNotThrow(()=>{
            
            const las = new Player('LasWonho','LAs aka Ika','Riven');
            
        })
    });
    it('move',()=>{
        assert.doesNotThrow(()=>{
            const las = new Player('LasWonho','LAs aka Ika','Riven');
            las.Move(1,2);
            assert.equal(las.positionX,1);
            assert.equal(las.positionY,2);
            las.Move(3,-4);
            assert.equal(las.positionX,3);
            assert.equal(las.positionY,-4);
        });
    });
    it('end game',()=>{
        assert.doesNotThrow(async ()=>{
            const las = new Player('LasWonho','LAs aka Ika','Riven');
            await las.SaveResultToDB(10,'TeamA','afkjlkjhaskfdjahsldkfjhasz')
            .then(data=>console.log('data id '+data));
        })
    });
})