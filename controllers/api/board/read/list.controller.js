const Schema = require('../../../../models/functions');

const List = (req, res, next) => {
    let data = {
        board: req.body.board,
        page: req.body.page,
        view: req.body.view,
        user: req.body.user
    }

    if(data.user == undefined || data.user == ''){
        data.user = undefined;
    }

    if(/^(\-|\+)?([0-9]+)$/.test( data.page ) && parseInt( data.page ) > 0){
        data.page = Number(data.page);
    }else{
        data.page = 0;
    }

    if(/^(\-|\+)?([0-9]+)$/.test( data.view ) && parseInt( data.view ) > 0){
        data.view = Number(data.view);
    }else{
        data.view = 15;
    }

    const onError = (error) => {
        res.status(401).json({
            state: 'error',
            message: error.message
        })
    }

    const onResponse = (payload, count) => {
        res.status(200).json({
            state: 'success',
            payload,
            count
        })
    }

    const Count = async () => {
        let AllCount = {};
        await Schema.POST.Read.Count(data).then((req) => {
            try {
                AllCount = req[0].count;
            }catch(err){
                AllCount = 0;
            }
        });

        return AllCount;
    }

    const Page = async () => {
        let ListRequest = {};
        await Schema.POST.Read.Page(data).then((req) => {
            ListRequest = req;
        }).catch((err) => {
            throw new Error(err);
        });

        return ListRequest;
    }

    const RunCommand = async () => {
        try {
            let AllCount = await Count();
            let ListRequest = await Page();
            
            ListRequest.map(item => {
                // 댓글 수 설정
                if(typeof item.comment == 'object'){
                    try{
                        if(typeof item.comment[0].count == 'number'){
                            item.comment = item.comment[0].count;
                        }else {
                            item.comment = 0;
                        }
                    }catch(err){
                        item.comment = 0;
                    }
                }else {
                    item.comment = 0;
                }


                // 좋아요 눌렀는지 설정
                if(typeof item.like_check == 'object'){
                    try{
                        if(typeof item.like_check[0].count == 'number'){
                            item.like_check = true;
                        }else {
                            item.like_check = false;
                        }
                    }catch(err){
                        item.like_check = false;
                    }
                }else {
                    item.like_check = false;
                }

                // 좋아요 수 설정
                if(typeof item.like_count == 'object'){
                    try{
                        if(typeof item.like_count[0].count == 'number'){
                            item.like_count = item.like_count[0].count;
                        }else {
                            item.like_count = 0;
                        }
                    }catch(err){
                        item.like_count = 0;
                    }
                }else {
                    item.like_count = 0;
                }

                // 조회수 설정
                if(typeof item.views_count == 'object'){
                    try{
                        if(typeof item.views_count[0].count == 'number'){
                            item.views_count = item.views_count[0].count;
                        }else {
                            item.views_count = 0;
                        }
                    }catch(err){
                        item.views_count = 0;
                    }
                }else {
                    item.views_count = 0;
                }
            });

            onResponse(ListRequest, AllCount);
        }catch(err){
            console.log(err);
            onError(err);
        }
    }
    RunCommand();


}

module.exports = List;
