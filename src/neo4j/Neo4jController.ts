const neo4j = require('neo4j-driver');
const config = require('../../data/config.json');

import D3Helper from './helpers/D3Helper';

export default class Neo4jController {

    public driver: any;

    protected _debug: boolean;

    constructor(options: any = {}) {
        this._debug = false;
        if (options.debug) {
            this._debug = true;
        }
        this.driver = neo4j.driver(config.neo4j.url, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
    }

    call(cypher:string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let session: any = this.driver.session();
            session.run(cypher, params)
                .then(function (result: any) {
                    session.close();
                    resolve(result);
                })
                .catch(function (error: any) {
                    reject(error);
                });
        });
    }

    parseCypherWithD3Helper(cypher:string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.call(cypher, params)
                .then(response => {
                    resolve(D3Helper.data(response));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }

    getNodesWithPropertyAndValue(property: string, value: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let cypher: string = `
                MATCH (n {${property}: "${value}"})-[r]-(p)
                return n,r,p
            `;
            this.call(cypher)
                .then(response => {
                    resolve(D3Helper.data(response));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }



    updateNodeWithIdAndProperties(id: number, properties: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let cypher: string = `
                match (n) WHERE ID(n) = ${id}
                set n = { props }
            `;
            this.call(cypher, {props: properties})
                .then(response => {
                    resolve(D3Helper.data(response));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }

    test() {
        this.call('MATCH (n) return n LIMIT 10')
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.log(error);
            })
    }
}
