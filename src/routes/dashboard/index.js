import clsx from 'clsx';
import React, { useEffect } from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { httpRequest } from '../../utils/httpReq';
import Moment from 'moment';

import LineChart from '../../components/lineChart';
import BarChart from '../../components/barChart';

import salesIcon from '../../sales.png';
import userIcon from '../../user.png';
import accessIcon from '../../access.png';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import func from '../../utils/functions';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';

import { Player } from 'video-react';
import HLSSource from '../../components/HLSSource';

export default (props) => {
    // console.log(props)

    const { classes, history } = props;
    const [access, setAccess] = React.useState(0);
    const [register, setRegister] = React.useState(0);
    const [sales, setSales] = React.useState(0);

    const [chartJoin, setChartJoin] = React.useState();
    const [chartAccess, setChartAccess] = React.useState();

    const [accessPeriod, setAccessPeriod] = React.useState('');

    const [adjustment, setAdjustment] = React.useState([]);
    const [report, setReport] = React.useState([]);

    const [curation, setCuration] = React.useState({});
    const [videoTheme, setvideoTheme] = React.useState([]);

    useEffect(() => {
        dataReq();
    }, []);

    const dataReq = (q) => {
        return new Promise(async (r, e) => {
            let now = Moment().format('YYYY-MM-DD');

            let limit6 = 4;
            let limit7 = 4;

            let urlObj = {
                // 매출 및 조회수
                url1: '/api/v1/admin/statistics/daily/earnings',
                url2: '/api/v1/admin/statistics/daily/join',
                url3: '/api/v1/admin/statistics/daily/login',

                // 그래프
                url4: `/api/v1/admin/statistics/day/in7days/join?date=${now}`,
                url5: `/api/v1/admin/statistics/day/in-week/login?date=${now}`,

                // 내역
                url6: `/api/v1/admin/points/manage/adjustment/apply/list?limit=${limit6}&offset=1`,
                url7: `/api/v1/admin/report/list/simple?limit=${limit7}&offset=1`,

                // 큐레이션
                url8: `/api/v1/admin/post/owner/curation`,

                // 영상테마
                url9: `/api/v1/admin/post/owner/pick/list?limit=5&offset=1`,

                // /api/v1/admin/post/owner/pick/12
            };

            const headers = {
                token: window.localStorage.getItem('token'),
            };

            let resArr = [];
            let dataArr = [null, null, null, null, null, null, null, null, null];

            for (let url of Object.values(urlObj)) {
                resArr.push(await httpRequest('GET', url, headers, null));
            }

            let i = -1;
            for (let item of resArr) {
                i++;

                if (!item['success']) {
                    if (item['code'] !== 1001) {
                        if (item['code'] === 1008) {
                            func.removeToken();
                        }
                    }
                    continue;
                }

                dataArr[i] = item.data;
            }

            setSales(func.numberWithCommas(dataArr[0].daily_earnings));
            setRegister(func.numberWithCommas(dataArr[1].daily_join));
            setAccess(func.numberWithCommas(dataArr[2].daily_login));
            setCuration(dataArr[7]);
            setvideoTheme(dataArr[8]);

            /// 라인 차트 데이터 설정.
            let lineData = [];

            for (let i = 1; i < 8; i++) {
                let now = new Date();

                let data = {
                    date: Moment(now.setDate(now.getDate() - 7 + i)).format('MM.DD'),
                    join_cnt: 0,
                };

                lineData.push(data);
            }

            for (let item of dataArr[3] ? dataArr[3] : []) {
                lineData[item.idx - 1].join_cnt = item.join_cnt;
            }

            // console.log(lineData)

            let lineChartData = {
                title: '',
                data: lineData,
            };

            // console.log("line", lineChartData);
            setChartJoin(lineChartData);

            /// 바 차트 설정.
            let week = ['일', '월', '화', '수', '목', '금', '토'];

            let startDate = new Date();
            startDate.setDate(startDate.getDate() - ((startDate.getDay() === 0 ? 7 : startDate.getDay()) - 1));

            let endDate = new Date();
            endDate.setDate(endDate.getDate() - ((endDate.getDay() === 0 ? 7 : endDate.getDay()) - 7 - 1) - 1);

            let period = `(${Moment(startDate).format('YYYY-MM-DD')} ~ ${Moment(endDate).format('YYYY-MM-DD')})`;

            setAccessPeriod(period);

            let barData = [];

            for (let i = 1; i < 8; i++) {
                let data = {
                    date: Moment(startDate).format('MM.DD') + ' ' + week[startDate.getDay()],
                    dayOfWeek: startDate.getDay() + 1,
                    access_cnt: 0,
                };

                startDate.setDate(startDate.getDate() + 1);
                barData.push(data);
            }

            for (let item of dataArr[4] ? dataArr[4] : []) {
                barData[item.dayofweek - 2 >= 0 ? item.dayofweek - 2 : item.dayofweek - 2 + 7].access_cnt = item.access_cnt;
            }

            let barChartData = {
                title: '',
                data: barData,
            };

            // console.log("bar", barChartData);
            setChartAccess(barChartData);

            setAdjustment(dataArr[5]);

            for (let item of dataArr[6] ? dataArr[6] : []) {
                switch (item.category) {
                    case 1:
                        item.reason = '명예훼손/사생활 침해 및 저작권 침해 등';
                        break;
                    case 2:
                        item.reason = '음란성 또는 청소년에게 부적합한 콘텐츠';
                        break;
                    case 3:
                        item.reason = '폭력 또는 혐오스러운 콘텐츠';
                        break;
                    case 4:
                        item.reason = '불법, 유해한 위험행위 등 부적절한 콘텐츠';
                        break;
                    case 5:
                        item.reason = '기타';
                        break;
                    default:
                        item.reason = '기타';
                        break;
                }
            }

            setReport(dataArr[6]);
        });
    };

    const goCuration = () => {
        window.location.href = '/admin/post/curation/manage';
    };

    const goTheme = () => {
        window.location.href = '/admin/post/theme/list';
    };
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                    <h3>오늘 총 매출</h3>
                    <TableRow key={'row'}>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <img width={'64px'} src={salesIcon} />
                        </TableCell>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <h3>{sales}</h3>
                        </TableCell>
                    </TableRow>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                    <h3>오늘 가입자 수</h3>
                    <TableRow key={'row'}>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <img width={'64px'} src={userIcon} />
                        </TableCell>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <h3>{register}</h3>
                        </TableCell>
                    </TableRow>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                    <h3>오늘 접속자 수</h3>
                    <TableRow>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <img width={'64px'} src={accessIcon} />
                        </TableCell>
                        <TableCell
                            style={{
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                borderBottom: '0px',
                            }}
                        >
                            <h3>{access}</h3>
                        </TableCell>
                    </TableRow>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={12}>
                <Paper className={classes.paper}>
                    <h3
                        style={{
                            cursor: 'pointer',
                        }}
                        onClick={goCuration}
                    >
                        큐레이션
                    </h3>
                    <hr className="hr-line"></hr>
                    {curation && Object.keys(curation).length > 0 ? (
                        <div
                            style={{
                                marginTop: '5px',
                            }}
                        >
                            <TableRow>
                                <TableCell
                                    style={{
                                        paddingTop: '0px',
                                        paddingBottom: '0px',
                                        borderBottom: '0px',
                                    }}
                                >
                                    <strong style={{ fontSize: '17px' }}>{curation.title}</strong>
                                </TableCell>
                            </TableRow>
                            <TableContainer className="video-table">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            {curation.list ? (
                                                curation.list.map((row, index) => (
                                                    <TableCell key={row.id} className={classes.tableCell} align="center">
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                margin: '2px 8px',
                                                            }}
                                                        >
                                                            <Player
                                                                ref={(player) => {
                                                                    if (player?.volume) {
                                                                        player.volume = 0.5;
                                                                    }
                                                                }}
                                                                className="dashboard"
                                                                poster={row.thumbnail ? process.env.REACT_APP_API_URL + row.thumbnail : ''}
                                                                fluid={false}
                                                                width={280}
                                                                height={160}
                                                                controls
                                                            >
                                                                <HLSSource isVideoChild inactive={true} src={process.env.REACT_APP_VIDEO_URL + row.video} />
                                                            </Player>
                                                            <strong
                                                                style={{
                                                                    marginTop: '10px',
                                                                    fontSize: '15px',
                                                                    color: '#666666',
                                                                    fontWeight: '600',
                                                                    wordBreak: 'keep-all',
                                                                }}
                                                            >
                                                                {row.title}
                                                            </strong>
                                                        </div>
                                                    </TableCell>
                                                ))
                                            ) : (
                                                <TableCell></TableCell>
                                            )}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    ) : (
                        <TableRow></TableRow>
                    )}
                </Paper>
            </Grid>
            <Grid item xs={12} sm={12}>
                <Paper className={classes.paper}>
                    <h3
                        style={{
                            cursor: 'pointer',
                        }}
                        onClick={goTheme}
                    >
                        영상테마
                    </h3>
                    {/* <hr className="hr-line"></hr> */}
                    <div
                        style={{
                            marginTop: '5px',
                        }}
                    >
                        <TableContainer className="video-table">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        {videoTheme ? (
                                            videoTheme.map((row, index) => (
                                                <TableCell key={row.id} className={classes.tableCell} align="center">
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            margin: '2px 8px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '260px',
                                                                height: '180px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => {
                                                                window.location.href = `/admin/post/theme/item/${row.id}`;
                                                            }}
                                                        >
                                                            <img
                                                                style={{
                                                                    borderRadius: '5px',
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                }}
                                                                src={process.env.REACT_APP_API_URL + row.thumbnail}
                                                                alt=""
                                                            />
                                                        </div>
                                                        <strong
                                                            style={{
                                                                marginTop: '10px',
                                                                fontSize: '15px',
                                                                color: '#666666',
                                                                fontWeight: '600',
                                                            }}
                                                        >
                                                            {row.title}
                                                        </strong>
                                                    </div>
                                                </TableCell>
                                            ))
                                        ) : (
                                            <TableCell></TableCell>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Paper className={classes.paper}>
                    <h3 style={{ display: 'contents' }}>가입자 추이 </h3>
                    <span style={{ display: 'contents' }}>(7일간 가입자 수)</span>
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>{chartJoin ? <LineChart chartData={chartJoin} /> : ''}</div>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Paper className={classes.paper}>
                    <h3 style={{ display: 'contents' }}>요일별 접속자 수 </h3>
                    <span style={{ display: 'contents' }}>{accessPeriod}</span>
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>{chartAccess ? <BarChart chartData={chartAccess} /> : ''}</div>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Paper className={classes.paper}>
                    <h3>정산 신청 내역</h3>
                    <TableContainer>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.tableCell} align="center">
                                        신청일
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="center">
                                        회원 닉네임
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="center">
                                        정산 포인트 / 정산 금액
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {adjustment && adjustment[0] ? (
                                    adjustment.map((row, index) => (
                                        <TableRow key={row.id} hover>
                                            {/*<TableCell className={classes.tableCell} align="center" onClick={() => moreBtnHandler(row)}>{row.id}</TableCell>*/}
                                            <TableCell className={classes.tableCell} align="center">
                                                {row.create_at}
                                            </TableCell>
                                            <TableCell id={'u' + row.user_id} className={classes.tableCell} align="center">
                                                {row.nickname}
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="center">
                                                {func.numberWithCommas(row.point_quantity) + ' / ' + func.numberWithCommas(row.point_quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Paper className={classes.paper}>
                    <h3>신고 내역</h3>
                    <TableContainer>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.tableCell} align="center">
                                        신청일
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="center">
                                        신고 유형
                                    </TableCell>
                                    <TableCell className={classes.tableCell} align="center">
                                        신고 사유
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {report && report[0] ? (
                                    report.map((row, index) => (
                                        <TableRow key={row.id} hover>
                                            {/*<TableCell className={classes.tableCell} align="center" onClick={() => moreBtnHandler(row)}>{row.id}</TableCell>*/}
                                            <TableCell className={classes.tableCell} align="center">
                                                {row.create_at}
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="center">
                                                {row.target === 'video' ? '영상' : '댓글'}
                                            </TableCell>
                                            <TableCell className={classes.tableCell} align="center">
                                                {row.reason}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};
