import clsx from 'clsx';
import React, { useEffect } from 'react'

import Paper from '@material-ui/core/Paper';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { httpRequest } from "../../utils/httpReq";
import DialogAlert, { AlertText } from "../../utils/dialogAlert";
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import flIcon from "../../flatform.png";


import { deepOrange, deepPurple } from '@material-ui/core/colors';


import Link from "@material-ui/core/Link";

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";

import { Player } from 'video-react';
import func from "../../utils/functions";
import userIcon from "../../user.png";
import InputAdornment from "@material-ui/core/InputAdornment";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

// import 'video-react/dist/video-react.css';


export default (props) => {
    const { classes, history, match } = props
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

    // const ava = useStyles();

    const [info, setInfo] = React.useState({});
    const [creator, setCreator] = React.useState();
    const [point, setPoint] = React.useState();
    const [sponsoring, setSponsoring] = React.useState();
    const [sponsored, setSponsored] = React.useState();
    const [reply, setReply] = React.useState();
    const [video, setVideo] = React.useState();


    useEffect(() => {
        getMemberInfo()
    }, [])


    const [open, setOpen] = React.useState({ 0: false, 1: false, 2: false })
    const [text, setText] = React.useState('')

    const openAlert = (text) => {

        setText(text)
        setOpen({ 0: false, 1: false, 2: true })
        setTimeout(function () {
            setOpen({ 0: false, 1: false, 2: false })
        }, 700);
    }


    const getMemberInfo = (q) => {
        return new Promise(async (r, e) => {

            // console.log("match", match)

            if (!match.params.id) {
                return
            }

            let urlArr = []

            urlArr[0] = `/api/v1/admin/user/manage/member/detail/user?user_id=${match.params.id}`
            urlArr[1] = `/api/v1/admin/user/manage/member/detail/point/quantity?user_id=${match.params.id}`
            urlArr[2] = `/api/v1/admin/user/manage/member/detail/sponsoring/point?user_id=${match.params.id}`


            let limit = 3;
            urlArr[3] = `/api/v1/admin/user/manage/member/detail/reply/list?user_id=${match.params.id}&limit=${limit}&offset=1`

            const headers = {
                'token': window.localStorage.getItem('token')
            }

            let resArr = [];
            let errChk = 0;

            for (let url of urlArr) {
                let res = await httpRequest('GET', url, headers, null)

                resArr.push(res)

                if (!res['success'] || res['code'] !== 1000) {

                    if (res['code'] !== 1001) {
                        // removeToken()

                        errChk++;

                        if (res['code'] === 1008) {
                            func.removeToken()
                        }
                        // alert('???????????? ??????')
                    }
                }
            }

            // console.log(resArr);

            let item = resArr[0]['data'];
            setInfo(item)

            setPoint(resArr[1]["data"])
            setSponsoring(resArr[2]["data"])
            setReply(resArr[3]["data"])

            if (item.is_creator > 0) {

                let urlArr = []

                urlArr[0] = `/api/v1/admin/user/manage/member/detail/creatorApply?user_id=${match.params.id}`
                urlArr[1] = `/api/v1/admin/user/manage/member/detail/sponsored/point?user_id=${match.params.id}`

                let limit = 3;

                urlArr[2] = `/api/v1/admin/user/manage/member/detail/upload/list?user_id=${match.params.id}&limit=${limit}&offset=1`


                const headers = {
                    'token': window.localStorage.getItem('token')
                }


                let resArr = [];

                for (let url of urlArr) {
                    let res = await httpRequest('GET', url, headers, null)

                    resArr.push(res)

                    if (!res['success'] || res['code'] !== 1000) {

                        res.data = null;

                        if (res['code'] !== 1001) {
                            // removeToken()
                            errChk++;

                            if (res['code'] === 1008) {
                                func.removeToken()
                            }
                            // alert('???????????? ??????')
                        }
                    }
                }

                if (errChk > 0) {
                    alert('???????????? ??????')
                }

                // console.log("creator ", resArr)

                setSponsored(resArr[1]["data"])
                setVideo(resArr[2]["data"])

                // setSponsored(resArr[1]["data"])
                // setVideo(resArr[2]["data"])

                if (resArr[0]["success"]) {

                    let item = resArr[0]["data"]

                    let arr = item.account.split("+");

                    if (arr.length === 2) {
                        item.bank = arr[0];
                        item.account_num = arr[1];
                    }

                    setCreator(item);
                }
            }
        })
    }


    const numberWithCommas = (x) => {

        if (!x)
            return 0;

        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    const chkBlind = (id, _type) => {
        setOpen({ 0: false, 1: false, 2: false })

        return new Promise(async (result, err) => {

            //  console.log(id)

            let url = _type > 0 ? "/api/v1/admin/user/manage/chk/suspend/member" : "/api/v1/admin/user/manage/unchk/suspend/member"
            const headers = {
                'token': window.localStorage.getItem('token'),
                'Content-type': 'application/json; charset=utf-8'
            }

            let res;
            let data = {
                user_id: id
            }

            //  console.log(data);
            res = await httpRequest('POST', url, headers, JSON.stringify(data))

            if (res['code'] > 1000) {
                alert('??????')
                return
            }

            //  console.log(res)
            openAlert("?????? ?????? ???????????????")
            setTimeout(function () {
                window.location.reload()
            }, 700)
        })
    }

    const removeSession = async () => {
        for (const [k] of Object.entries(window.sessionStorage)) {
            window.sessionStorage.removeItem(k)
        }
    }

    return (
        <>
            <DialogAlert open={open[0]} handleClose={() => setOpen({ ...open, 0: false })} text={"?????? ???????????????????"}
                fn={() => chkBlind(match.params.id, 1)} />
            <DialogAlert open={open[1]} handleClose={() => setOpen({ ...open, 1: false })} text={"?????? ?????? ???????????????????"}
                fn={() => chkBlind(match.params.id, 0)} />
            <AlertText open={open[2]} handleClose={() => setOpen({ ...open, 2: false })} text={text} classes={classes} />
            <Paper className={classes.paper}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography component="h2" variant="h5" color="initial" gutterBottom
                            style={{ paddingTop: '5px', margin: 0 }} onClick={() => {
                                // console.log(info)
                            }}>
                            ?????? ??????
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        {!info.suspend_chk ?
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                style={
                                    {
                                        backgroundColor: '#FFAE64'
                                    }
                                }
                                onClick={() => {
                                    setOpen({ ...open, 0: true })
                                }}
                            >??????</Button> :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setOpen({ ...open, 1: true })
                                }}
                            >?????? ??????</Button>
                        }
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            style={{ fontWeight: 'bold', color: '#041E62', backgroundColor: '#E0E7F7' }}
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={() => {


                                // history.push('/admin/member/user/list')
                                history.goBack()

                                //
                            }}
                        >????????????</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* ?????? ????????? */}
            <TextField
                className={classes.marginTop30}
                style={{ marginLeft: '10px' }}
                InputProps={{
                    readOnly: true,
                    disableUnderline: true, classes: { input: classes.fontSize22 }
                }}
                value="?????? ?????????"
            />
            <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={7}
                        style={{
                            padding: "20px",

                        }}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.tableCellNotBorder}
                                        width={80}
                                    >
                                        <Avatar src={info.icon ? process.env.REACT_APP_API_URL + info.icon : ""}
                                            style={{
                                                color: "white",
                                                width: "70px",
                                                height: "70px",
                                                // backgroundColor: deepOrange[500],
                                                align: 'right',
                                            }}
                                        >{info.nickname ? info.nickname.slice(0, 1) : ""}</Avatar>
                                    </TableCell>
                                    <TableCell className={classes.tableCellNotBorder}>
                                        <h3>{info.nickname}</h3>
                                        {info.is_creator ?
                                            <img width={"20px"} height={"20px"}
                                                src={flIcon} /> : ""
                                        }
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={12} sm={5}>

                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????? ??????"
                            name="type"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['is_creator'] > 0 ? "???????????????" : '??????'}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????????"
                            name="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info.create_at}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????? ?????????"
                            name="nickname"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info.nickname}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="??????"
                            name="name"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['name'] ? info['name'] : ''}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="????????? ??????"
                            name="ph"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['phone'] ? info['phone'] : ''}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????????"
                            name="email"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['email'] ? info["email"] : ''}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default",
                                    fontWeight: "bold"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="birth"
                            label="????????????"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['birth'] ? info['birth'] : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default",
                                    fontWeight: "bold"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="??????"
                            name="gender"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['gender'] ? info['gender'] === 1 ? "???" : "???" : ''}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <TextField
                            label="??????"
                            name="address"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={info['address'] ? info['address'].replace("+", ") ").replaceAll("+", " ") : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default",
                                    fontWeight: "bold"
                                }
                            }
                        />
                    </Grid>
                </Grid>
                <hr />
            </Paper>

            {/*???????????? ??????*/
            }
            {
                creator ?
                    <TextField
                        className={classes.marginTop30}
                        style={{ marginLeft: '10px', marginTop: "50px" }}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true, classes: { input: classes.fontSize22 }
                        }}
                        value="??????????????? ?????? ??????"
                    /> : ""
            }
            {
                creator ?
                    <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                        <Grid container spacing={3}>

                            <Grid item xs={12} sm={5}>
                                <TextField
                                    label="??????"
                                    name="name"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['name'] ? creator['name'] : ''}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={7}>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label="?????? ??????"
                                    name="intro"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['intro'] ? creator['intro'] : ''}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="sns ??????"
                                    name="sns"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator.sns}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="?????? ?????? ??????"
                                    name="activity_region"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator.activity_region}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="?????????"
                                    name="bank"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['bank'] ? creator['bank'] : ''}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="????????????"
                                    name="account"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['account_num'] ? creator["account_num"] : ''}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default",
                                            fontWeight: "bold"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label="?????? ?????? ??????"
                                    name="piece"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['piece'] ? creator['piece'] : ""}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default",
                                            fontWeight: "bold"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label="????????? ????????? ?????? ??????"
                                    name="copyright"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={creator['copyright'] ? "??????" : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="end">
                                                <CheckCircleIcon style={{ color: "#606060" }} />
                                            </InputAdornment>
                                        ),
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default",
                                            fontWeight: "bold"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <label
                                    style={{
                                        color: 'rgba(0, 0, 0, 0.54)',
                                        padding: '0',
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                        fontWeight: '400',
                                        lineHeight: '1',
                                        letterSpacing: '0.00938em',

                                    }}
                                >?????? ??????</label>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TableRow>
                                    {creator.images ?
                                        <TableRow>

                                            <TableCell width={"33.3%"}
                                                className={classes.tableCellNotBorder}
                                                align="left">
                                                {creator.images[0] ?
                                                    <img width={"100%"} height={"250px"}
                                                        src={process.env.REACT_APP_API_URL + creator.images[0]} />
                                                    : ""}
                                            </TableCell>
                                            <TableCell width={"33.3%"}
                                                className={classes.tableCellNotBorder}
                                                align="left">
                                                {creator.images[1] ?
                                                    <img width={"100%"} height={"250px"}
                                                        src={process.env.REACT_APP_API_URL + creator.images[1]} />
                                                    : ""}
                                            </TableCell>
                                            <TableCell width={"33.3%"}
                                                className={classes.tableCellNotBorder}
                                                align="left">
                                                {creator.images[2] ?
                                                    <img width={"100%"} height={"250px"}
                                                        src={process.env.REACT_APP_API_URL + creator.images[2]} />
                                                    : ""}
                                            </TableCell>
                                        </TableRow>
                                        : <TableRow></TableRow>}
                                </TableRow>

                            </Grid>
                        </Grid>
                        <hr />
                    </Paper> : ""
            }


            {/* ????????? ?????? */
            }
            <TextField
                className={classes.marginTop30}
                style={{ marginLeft: '10px', marginTop: "50px" }}
                InputProps={{
                    readOnly: true,
                    disableUnderline: true, classes: { input: classes.fontSize22 }
                }}
                value="?????????"
            />
            <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????? ?????????"
                            name="own_point"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={point ? numberWithCommas(point["total_points"]) + " P" : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="?????? ?????????"
                            name="using_point"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={point ? numberWithCommas(point["total_using"]) + " P" : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Paper className={clsx(classes.paper, classes.marginTop10)}
                        style={{
                            width: '100%',
                            margin: '10px',
                            marginTop: '20px'
                        }}>
                        <Typography variant="body2" color="#041E62" fontWeight="bold" align="center">
                            {/* TODO : ?????? ???????????? ??? ????????? ???????????? ??????*/}
                            <Link onClick={() => {
                                removeSession()
                            }} color="inherit" href={"/admin/member/user/point/" + match.params.id}>+ ?????? ??????</Link>
                        </Typography>
                    </Paper>

                </Grid>
            </Paper>

            {/* ?????? ?????? */
            }
            <TextField
                className={classes.marginTop30}
                style={{ marginLeft: '10px', marginTop: "50px" }}
                InputProps={{
                    readOnly: true,
                    disableUnderline: true, classes: { input: classes.fontSize22 }
                }}
                value="??????"
            />

            <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="- ????????? ?????????"
                            name="sponsor_point"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={sponsoring ? numberWithCommas(sponsoring["total_sponsoring"]) + " P" : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}></Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="- ?????? ?????? ?????????"
                            name="sponsoring_video"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={sponsoring ? numberWithCommas(sponsoring["total_sponsoring_video"]) + " P" : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="- ??????????????? ?????? ?????????"
                            name="sponsoring_creator"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={sponsoring ? numberWithCommas(sponsoring["total_sponsoring_creator"]) + " P" : ""}
                            InputProps={{
                                readOnly: true,
                                classes: { input: classes.paddingLT }
                            }}
                            style={
                                {
                                    cursor: "default"
                                }
                            }
                        />
                    </Grid>
                    <Paper className={clsx(classes.paper, classes.marginTop10)}
                        style={{
                            width: '100%',
                            margin: '10px',
                            marginTop: '20px'
                        }}>
                        <Typography variant="body2" color="#041E62" fontWeight="bold" align="center">
                            {/* TODO : ?????? ???????????? ??? ????????? ???????????? ??????*/}
                            <Link onClick={() => {
                                removeSession()
                            }} color="inherit" href={"/admin/member/user/sponsoring/" + match.params.id}>+ ?????? ??????</Link>
                        </Typography>
                    </Paper>

                </Grid>
            </Paper>


            {/* ?????? ?????? ???*/
                sponsored ?
                    <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="+ ?????? ?????? ?????????"
                                    name="sponsored_point"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={sponsored ? numberWithCommas(sponsored["total_sponsored"]) + " P" : ""}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}></Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="+ ?????? ?????? ?????????"
                                    name="sponsored_video"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={sponsored ? numberWithCommas(sponsored["total_sponsored_video"]) + " P" : ""}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="+ ??????????????? ?????? ?????????"
                                    name="sponsoring_creator"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={sponsored ? numberWithCommas(sponsored["total_sponsored_creator"]) + " P" : ""}
                                    InputProps={{
                                        readOnly: true,
                                        classes: { input: classes.paddingLT }
                                    }}
                                    style={
                                        {
                                            cursor: "default"
                                        }
                                    }
                                />
                            </Grid>
                            <Paper className={clsx(classes.paper, classes.marginTop10)}
                                style={{
                                    width: '100%',
                                    margin: '10px',
                                    marginTop: '20px'
                                }}>
                                <Typography variant="body2" color="#041E62" fontWeight="bold" align="center">
                                    {/* TODO : ?????? ???????????? ??? ????????? ???????????? ??????*/}
                                    <Link onClick={() => {
                                        removeSession()
                                    }} color="inherit" href={"/admin/member/user/sponsored/" + match.params.id}>+ ??????
                                        ??????</Link>
                                </Typography>
                            </Paper>
                        </Grid>
                    </Paper>
                    : ""
            }


            {/*?????? ??????*/}
            {
                video ?
                    <TextField
                        className={classes.marginTop30}
                        style={{ marginLeft: '10px', marginTop: "50px" }}
                        InputProps={{
                            readOnly: true,
                            disableUnderline: true, classes: { input: classes.fontSize22 }
                        }}
                        value="????????? ??????"
                    /> : ""
            }
            {
                video ?
                    <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={12}>
                                <TableContainer>
                                    <Table className={classes.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className={classes.tableCell} align="center">?????????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">?????????</TableCell>
                                                <TableCell className={classes.tableCell} align="center"
                                                    style={{ paddingLeft: '40px' }}
                                                >??????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">?????????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">??????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">??????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">??????</TableCell>
                                                <TableCell className={classes.tableCell} align="center">???</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {video ? video.map((row, index) => (
                                                <TableRow key={row.id} hover>

                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.create_at}</TableCell>
                                                    <TableCell className={classes.tableCell} align="center"
                                                    >{row.nickname}</TableCell>

                                                    <TableCell className={classes.tableCell}
                                                        align="left"
                                                        style={
                                                            {
                                                                paddingTop: '10px',
                                                                paddingBottom: '10px'
                                                            }}
                                                    >
                                                        <TableCell
                                                            style={
                                                                {
                                                                    paddingTop: '0px',
                                                                    paddingBottom: '0px',
                                                                    borderBottom: "0px"
                                                                }}
                                                        >
                                                            <img src={process.env.REACT_APP_API_URL + row.thumbnail}
                                                                height="120px" width="150px" />
                                                        </TableCell>
                                                        <TableCell
                                                            style={
                                                                {
                                                                    paddingTop: '0px',
                                                                    paddingBottom: '0px',
                                                                    borderBottom: "0px",
                                                                    width: "100%"
                                                                }}
                                                        >
                                                            <TextField
                                                                // className={classes.marginTop30}
                                                                style={{ marginLeft: '10px' }}
                                                                fullWidth
                                                                multiline
                                                                InputProps={{
                                                                    readOnly: true,
                                                                    disableUnderline: true,
                                                                    // classes: {input: classes.fontSize22}
                                                                }}
                                                                value={row.title}
                                                            />
                                                        </TableCell>
                                                    </TableCell>
                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.view_cnt}</TableCell>
                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.score}</TableCell>
                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.like_cnt}</TableCell>
                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.reply_cnt}</TableCell>
                                                    <TableCell className={classes.tableCell}
                                                        align="center"
                                                    >{row.dibs_cnt}</TableCell>

                                                </TableRow>
                                            )) : <TableRow></TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                        <Paper className={clsx(classes.paper, classes.marginTop10)}
                            style={{
                                width: '100%',
                                margin: '00px',
                                marginTop: '20px'
                            }}>
                            <Typography variant="body2" color="#041E62" fontWeight="bold" align="center">
                                {/* TODO : ?????? ???????????? ??? ????????? ???????????? ??????*/}
                                <Link onClick={() => {
                                    removeSession()
                                }} color="inherit" href={"/admin/member/user/video/" + match.params.id}>+ ?????? ??????</Link>
                            </Typography>
                        </Paper>
                    </Paper> : ""
            }

            {/* ?????? ?????? */
            }
            <TextField
                className={classes.marginTop30}
                style={{ marginLeft: '10px', marginTop: "50px" }}
                InputProps={{
                    readOnly: true,
                    disableUnderline: true, classes: { input: classes.fontSize22 }
                }}
                value="?????? ??????"
            />
            <Paper className={clsx(classes.paper, classes.marginTop10)} style={{ width: '100%' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                        <TableContainer>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.tableCell} align="center">?????????</TableCell>
                                        <TableCell className={classes.tableCell} align="center"
                                            style={{ paddingLeft: '40px' }}
                                        >?????????</TableCell>
                                        <TableCell className={classes.tableCell} align="center">?????? ??????</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reply ? reply.map((row, index) => (
                                        <TableRow key={row.id} hover>

                                            <TableCell className={classes.tableCell}
                                                align="center"
                                            >{row.create_at}</TableCell>
                                            <TableCell className={classes.tableCell}
                                                align="left"
                                                style={
                                                    {
                                                        paddingTop: '10px',
                                                        paddingBottom: '10px'
                                                    }}
                                            >
                                                <TableCell
                                                    style={
                                                        {
                                                            paddingTop: '0px',
                                                            paddingBottom: '0px',
                                                            borderBottom: "0px"
                                                        }}
                                                >
                                                    <img src={process.env.REACT_APP_API_URL + row.thumbnail}
                                                        height="120px" width="150px" />
                                                </TableCell>
                                                <TableCell
                                                    style={
                                                        {
                                                            paddingTop: '0px',
                                                            paddingBottom: '0px',
                                                            borderBottom: "0px",
                                                            width: "100%"
                                                        }}
                                                >
                                                    <TextField
                                                        // className={classes.marginTop30}
                                                        style={{ marginLeft: '10px' }}
                                                        fullWidth
                                                        multiline
                                                        InputProps={{
                                                            readOnly: true,
                                                            disableUnderline: true,
                                                            // classes: {input: classes.fontSize22}
                                                        }}
                                                        value={row.title}
                                                    />
                                                </TableCell>
                                            </TableCell>
                                            <TableCell className={classes.tableCell}
                                                align="center"
                                            >
                                                <TextField
                                                    InputProps={{
                                                        readOnly: true,
                                                        disableUnderline: true, classes: { input: classes.fontSize13 }
                                                    }}
                                                    multiline
                                                    rows={3}
                                                    rowsMax={5}
                                                    value={row.content}
                                                />
                                            </TableCell>

                                        </TableRow>
                                    )) : <TableRow></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
                <Paper className={clsx(classes.paper, classes.marginTop10)}
                    style={{
                        width: '100%',
                        margin: '00px',
                        marginTop: '20px'
                    }}>
                    <Typography variant="body2" color="#041E62" fontWeight="bold" align="center">
                        <Link onClick={() => {
                            removeSession()
                        }} color="inherit" href={"/admin/member/user/reply/" + match.params.id}>+ ??????
                            ??????</Link>
                    </Typography>
                </Paper>
            </Paper>
        </>
    )
}