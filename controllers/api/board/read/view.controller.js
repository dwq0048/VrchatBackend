const Schema = require('../../../../models/functions');

const view = (req, res, next) => {
    const onResponse = (payload) => { res.status(200).json({ state : 'success', payload }) };
    const onError = (message) => { res.status(401).json({ state : 'error', message : message }) };
    
    const LocalPayload = res.locals.payload;
    const client = { host : req.ip || req.headers.host };
    let data = { index: req.body.index, board: req.body.board, client : client.host };

    if(LocalPayload.status == 'success'){
        data.user = LocalPayload.info.index;
    }else {
        data.user = undefined;
    }

    const PostView = async () => {
        let ViewRequest = {};
        await Schema.POST.Read.View(data).then((req) => {
            ViewRequest = { status : true, payload : req }
        }).catch((error) => {
            throw new Error(error.message);
        })

        return ViewRequest;
    }

    const RunCommand = async () => {
        try{
            let ResultView = await PostView();
            ResultView = ResultView.payload[0];

            // 댓글 수 설정
            if(typeof ResultView.comment == 'object'){
                try{
                    if(typeof ResultView.comment[0].count == 'number'){
                        ResultView.comment = ResultView.comment[0].count;
                    }else {
                        ResultView.comment = 0;
                    }
                }catch(err){
                    ResultView.comment = 0;
                }
            }else {
                ResultView.comment = 0;
            }
            
            // 좋아요 눌렀는지 설정
            if(typeof ResultView.like_check == 'object'){
                try{
                    if(typeof ResultView.like_check[0].count == 'number'){
                        ResultView.like_check = true;
                    }else {
                        ResultView.like_check = false;
                    }
                }catch(err){
                    ResultView.like_check = false;
                }
            }else {
                ResultView.like_check = false;
            }

            // 좋아요 수 설정
            if(typeof ResultView.like_count == 'object'){
                try{
                    if(typeof ResultView.like_count[0].count == 'number'){
                        ResultView.like_count = ResultView.like_count[0].count;
                    }else {
                        ResultView.like_count = 0;
                    }
                }catch(err){
                    ResultView.like_count = 0;
                }
            }else {
                ResultView.like_count = 0;
            }

            // 조회수 설정
            if(typeof ResultView.views_count == 'object'){
                try{
                    if(typeof ResultView.views_count[0].count == 'number'){
                        ResultView.views_count = ResultView.views_count[0].count;
                    }else {
                        ResultView.views_count = 0;
                    }
                }catch(err){
                    ResultView.views_count = 0;
                }
            }else {
                ResultView.views_count = 0;
            }

            onResponse( ResultView );
        } catch (error){
            console.log(error);
            onError(error.message);
        }
    }
    RunCommand();

}

module.exports = view;
