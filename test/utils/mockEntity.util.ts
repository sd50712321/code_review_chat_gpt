import { ContractRepository } from '@/contracts/contract.repository'
import { Contract } from '@/contracts/entity/contract.entity'
import { CountryRepository } from '@/countries/country.repository'
import { Country } from '@/countries/entity/country.entity'
import { GoodsInfo } from '@/goodsInfos/entity/goodsInfo.entity'
import { GoodsInfoRepository } from '@/goodsInfos/goodsInfo.repository'
import { Invoice } from '@/invoices/entity/invoice.entity'
import { InvoiceType } from '@/invoices/invoice.constrants'
import { InvoiceRepository } from '@/invoices/invoice.repository'
import { TrackingRepository } from '@/trackings/tracking.repository'
import { INestApplication } from '@nestjs/common'
import { Connection, ObjectLiteral } from 'typeorm'

export async function insertContract(app: INestApplication, mockEntity?: ObjectLiteral) {
  const connection = app.get(Connection)
  const contractRepo = connection.getCustomRepository(ContractRepository)
  return contractRepo.save(
    {
      centerId: -99999,
      logisticsCode: '테스트용 코드',
      apiKey: '테스트용 API KEY',
      createdBy: -1,
      updatedBy: -1,
      ...mockEntity,
    },
    { reload: true }
  )
}

export async function insertGoodsInfo(app: INestApplication, mockEntity?: ObjectLiteral) {
  const connection = app.get(Connection)
  const goodsInfoRepo = connection.getCustomRepository(GoodsInfoRepository)
  return goodsInfoRepo.save(
    {
      name: '테스트용 상품명',
      createdBy: -1,
      updatedBy: -1,
      ...mockEntity,
    },
    { reload: true }
  )
}

export async function insertCountry(app: INestApplication, mockEntity?: ObjectLiteral) {
  const connection = app.get(Connection)
  const countryRepo = connection.getCustomRepository(CountryRepository)
  return countryRepo.save(
    {
      isoCode2: 'KR',
      isoCode3: 'KOR',
      name: '테스트용',
      displayName: '테스트용',
      createdBy: -1,
      updatedBy: -1,
      ...mockEntity,
    },
    { reload: true }
  )
}

export async function insertInvoice(
  app: INestApplication,
  relationEntities: { contract: Contract; goodsInfo: GoodsInfo | GoodsInfo[]; country: Country },
  mockEntity?: ObjectLiteral
) {
  const connection = app.get(Connection)
  const invoiceRepo = connection.getCustomRepository(InvoiceRepository)
  const { contract, goodsInfo, country } = relationEntities
  return invoiceRepo.save(
    {
      originalOrderId: '0101002',
      contract,
      goodsInfos: Array.isArray(goodsInfo) ? goodsInfo : [goodsInfo],
      country,
      type: InvoiceType.NORMAL,
      sender: {
        name: '배송자',
        address: {
          zipCode: '12345',
          fullAddress: '전체주소',
          address: '동이상 주소',
          addressDetail: '동이하 주소',
        },
        contact: {
          tel: '010-1234-1234',
          phone: '010-1234-1234',
        },
      },
      createdBy: -1,
      updatedBy: -1,
      ...mockEntity,
    },
    {
      reload: true,
    }
  )
}

export async function insertTracking(app: INestApplication, invoice: Invoice, mockEntity?: ObjectLiteral) {
  const connection = app.get(Connection)
  const trackingRepo = connection.getCustomRepository(TrackingRepository)
  return trackingRepo.save(
    {
      invoice,
      key: '추적키',
      status: 'PREPARED',
      message: '송장추적메시지',
      registeredAt: new Date(),
      etc: {
        cpm_job_sta: '10',
      },
      rawResponse: {
        cpm_wbl_num: 'serial',
        cpm_job_sta: '10',
        cpm_dlv_div: 'S',
        cpm_ord_num: 'order_number',
        cpm_wrk_dat: '2022-03-15 09:00:00',
        cpm_rgt_ymd: '20220315',
        cpm_snd_dat: '2022-03-15 09:00:00',
        cpm_rcv_dat: '2022-03-15 23:00:00',
        cpm_sta_cod: 'N',
        cpm_edi_cod: 'DOHANDS',
      },
      ...mockEntity,
    },
    { reload: true }
  )
}
